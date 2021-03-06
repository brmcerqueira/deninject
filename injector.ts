import { v4 } from "https://deno.land/std/uuid/mod.ts";
import { nonModulesMetadata, getParamtypesMetadata, getProviderMetadata, getReturntypeMetadata, getScopeMetadata, getSingletonMetadata, getTokenMetadata, TypeMetadata, getArgumentsMetadata, Identity, root, dynamicToken, IToken } from "./reflections/metadata.ts";
import { ScopeSymbol } from "./symbols/scopeSymbol.ts";
import { TokenSymbol } from "./symbols/tokenSymbol.ts";

const anything = "anything";

type Token = string | TokenSymbol;

type Dependency = { 
    id?: string,
    targetId?: string, 
    token?: IToken 
}

type Bind = {
    depth: number,
    get(token: Token | null): any
}

type Binds = {
    [key: string]: Bind
}

class BindError extends Error {
    constructor(identity: Identity<any> | null, token: Token | null) {
       super(`Bind not found for '${identity ? identity.name : ""}${token ? ` -> ${token?.toString()}` : ""}'.`);
    }
}

export interface IInjector {
    get<T>(identity: Identity<T>, token?: Token): T
    getByToken(token: Token): any
    sub(scope: string | ScopeSymbol, ...modules: any[]): IInjector
}

class SubInjector implements IInjector {
    private _depth: number = 1;

    private _cache: {                
        [key: string]: any
    } = {};

    private _binds: {                
        [key: string]: Binds
    } = {
        __root__: {}
    };

    protected constructor(scope: string | null, 
        parent: SubInjector | null,
        modules: any[]) {

        if (parent) {
            this._depth += parent._depth;
            for (const key in parent._binds) {
                if (key != root) {
                    this._binds[key] = {};
                } 
                let parentBinds = parent._binds[key];
                let binds = this._binds[scope && scope == key ? root : key];         
                for (const bindKey in parentBinds) {
                    if (!binds[bindKey] || (parentBinds[bindKey].depth >= binds[bindKey].depth)) {
                        binds[bindKey] = parentBinds[bindKey];
                    }                   
                }
            }
        }

        for (const key in nonModulesMetadata) {
            if ((!scope && key == root) || (scope && key == scope)) {
                nonModulesMetadata[key].forEach(metadata => {
                    this.buildType(this._binds.__root__, metadata); 
                });
            }       
        }
        
        modules.forEach(module => {
            getProviderMetadata(module).forEach(key => {    
                let target = getReturntypeMetadata(module, key);
                if (target) {
                    let binds = this._binds.__root__;

                    let scopeMetadata = getScopeMetadata(module, key);   

                    if (scopeMetadata && scopeMetadata != scope) {
                        if (!this._binds[scopeMetadata]) {
                            this._binds[scopeMetadata] = {};
                        }
                        binds = this._binds[scopeMetadata];
                    }

                    this.buildType(binds, {
                        isSingleton: getSingletonMetadata(module, key),
                        token: getTokenMetadata(module, key),
                        target: target,
                        dependencies: getParamtypesMetadata(module, key),
                        arguments: getArgumentsMetadata(module, key),
                        create(args: any[]): any {
                            let func: Function = module[key];
                            return func.apply(module, args);
                        }
                    });  
                }               
            })
        });
    }

    private buildType(binds: Binds, metadata: TypeMetadata) {
        let id = "";

        if (metadata.token) {
            id = this.tokenFormat(metadata.token.ignoreType ? anything : this.getId(metadata.target), metadata.token.id);
        }
        else {
            id = this.getId(metadata.target);
        }

        let dependencies: Dependency[] = metadata.dependencies.map((identity, index) => {
            const dependency: Dependency = {};

            if (metadata.arguments && metadata.arguments[index]) { 
                if (metadata.arguments[index] != dynamicToken) {
                    dependency.token = <IToken>metadata.arguments[index];
                    dependency.targetId = this.getId(identity);
                    dependency.id = this.tokenFormat(dependency.token.ignoreType ? anything : dependency.targetId, dependency.token.id);
                }
            } else {
                dependency.targetId = this.getId(identity);
                dependency.id = dependency.targetId;
            }

            return dependency;
        });

        if (binds[id] && binds[id].depth >= this._depth) {
            throw new Error(`Bind already defined for '${metadata.target.name}'.`);
        }
        else {
            dependencies.forEach((dep, index) => {               
                if (dep.id) {
                    let depId = dep.id;
                    let bindsRoot = this._binds.__root__;
                    if (bindsRoot[depId] && (!binds[depId] || (bindsRoot[depId].depth > binds[depId].depth))) {
                        binds[depId] = bindsRoot[depId]; 
                    }
                    else if(!binds[depId]) {
                        function getDefault(token: Token | null): any {
                            throw new BindError(metadata.dependencies[index], token);
                        } 

                        binds[depId] = {
                            depth: 0,
                            get: dep.token ? function(token: Token | null): any {
                                if (dep.targetId && binds[dep.targetId]) {
                                    return binds[dep.targetId].get(token);
                                }

                                return getDefault(token);
                            } : getDefault
                        }
                    }
                }
            });

            let resolve = (token: Token | null): any => {
                return metadata.create(dependencies.map(dep => {   
                    if (dep.id) {
                        let depToken = null;

                        if (dep.token) {
                            if (dep.token instanceof TokenSymbol) {
                                depToken = dep.token;
                            }
                            else {
                                depToken = (<IToken>dep.token).id;
                            }                                         
                        }
                        
                        return binds[dep.id].get(depToken); 
                    }
                    else {
                        return token;
                    }
                }));
            };

            binds[id] = {
                depth: this._depth,
                get: metadata.isSingleton ? (token: Token | null): any => {
                    if (this._cache[id]) {
                        return this._cache[id];
                    }
                    else {
                        let value = resolve(token);
                        this._cache[id] = value;
                        return value;
                    }
                } : resolve
            }
        }
    }

    private tokenFormat(id: string, token: string): string {
        return `${id}_${token}`;
    }

    private getId(identity: Identity<any>): string {
        let deninjectId = identity.__deninjectId__;

        if (!deninjectId) {
            deninjectId = v4.generate();
            identity.__deninjectId__ = deninjectId;
        }

        return deninjectId;
    }

    public get<T>(identity: Identity<T>, token?: Token): T {
        return this.privateGet(identity, token || null);
    }

    public getByToken(token: Token): any {
        return this.privateGet(null, token);
    }

    private privateGet<T>(identity: Identity<T> | null, token: Token | null): T {
        let id: string | null = null;
        let tokenValue: string | null = null;

        if (token) {
            if (token instanceof TokenSymbol) {
                tokenValue = token.id;
                if (token.ignoreType) {
                    id = anything;
                }
            }
            else {
                tokenValue = token;
            }
        }

        if (identity && identity.__deninjectId__ && !id) {
            id = identity.__deninjectId__;
        }

        if (!id) {
            throw new BindError(identity, token);
        }

        let bind: Bind | null = null;

        if (tokenValue) {
            bind = this._binds.__root__[this.tokenFormat(id, tokenValue)];           
        }

        if (!bind) {
            bind = this._binds.__root__[id];           
        }

        if (!bind) {
            throw new BindError(identity, token);
        }

        return bind.get(token);
    }

    public sub(scope: string | ScopeSymbol, ...modules: any[]): IInjector {
        return new SubInjector(scope instanceof ScopeSymbol ? scope.id : scope, this, modules);
    }
}

export class Injector extends SubInjector {
    constructor(...modules: any[]) {
        super(null, null, modules);
    }
}