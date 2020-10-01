import { generateHashCode } from "./generateHashCode.ts";
import { nonModulesMetadata, getParamtypesMetadata, getProviderMetadata, getReturntypeMetadata, getScopeMetadata, getSingletonMetadata, getTokenMetadata, TypeMetadata, getInjectMetadata, Identity, root } from "./reflections/metadata.ts";
import { ScopeSymbol } from "./symbols/scopeSymbol.ts";
import { TokenSymbol } from "./symbols/tokenSymbol.ts";

const anything = "anything";

type Binds = {
    [key: string]: {
        depth: number,
        get(): any
    }
}

class BindError extends Error {
    constructor(name: string) {
       super(`Bind not found for '${name}'.`);
    }
}

class SubInjector {
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
                        inject: getInjectMetadata(module, key),
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
            id = this.tokenFormat(metadata.token.ignoreType ? anything : this.getId(metadata.target), 
            metadata.token.value);
        }
        else {
            id = this.getId(metadata.target);
        }

        let dependencies = metadata.dependencies.map((func, index) => {
            if (metadata.inject && metadata.inject[index]) {
                let token = metadata.inject[index];
                return this.tokenFormat(
                    token.ignoreType ? anything : this.getId(func), 
                    token.value);
            } else {
                return this.getId(func);
            }
        });

        if (binds[id] && binds[id].depth >= this._depth) {
            throw new Error(`Bind already defined for '${metadata.target.name}'.`);
        }
        else {
            dependencies.forEach((key, index) => {
                let bindsRoot = this._binds.__root__;
                if (bindsRoot[key] && (!binds[key] || (bindsRoot[key].depth > binds[key].depth))) {
                    binds[key] = bindsRoot[key]; 
                }
                else if(!binds[key]) {
                    binds[key] = {
                        depth: 0,
                        get(): any {
                            throw new BindError(<string>metadata.dependencies[index].name);
                        }
                    }
                }
            });

            let resolve = (): any => {
                return metadata.create(dependencies.map(key => binds[key].get()));
            };

            binds[id] = {
                depth: this._depth,
                get: metadata.isSingleton ? (): any => {
                    if (this._cache[id]) {
                        return this._cache[id];
                    }
                    else {
                        let value = resolve();
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
            deninjectId = generateHashCode();
            identity.__deninjectId__ = deninjectId;
        }

        return deninjectId;
    }

    public get<T>(identity: Identity<T>, token?: string | TokenSymbol): T {
        return this.privateGet(identity, token || null);
    }

    public getByToken(token: string | TokenSymbol): any {
        return this.privateGet(null, token);
    }

    private privateGet<T>(identity: Identity<T> | null, token: string | TokenSymbol | null): T {
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
            throw new BindError(<string>(identity ? identity.name : tokenValue));
        }

        let bind = this._binds.__root__[tokenValue ? this.tokenFormat(id, tokenValue) : id];

        if (!bind) {
            throw new BindError(<string>(identity ? identity.name : tokenValue));
        }

        return bind.get();
    }

    public sub(scope: string | ScopeSymbol, ...modules: any[]): SubInjector {
        return new SubInjector(scope instanceof ScopeSymbol ? scope.id : scope, this, modules);
    }
}

export class Injector extends SubInjector {
    constructor(...modules: any[]) {
        super(null, null, modules);
    }
}