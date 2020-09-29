import { nonModulesMetadata, getParamtypesMetadata, getProviderMetadata, getReturntypeMetadata, getScopeMetadata, getSingletonMetadata, getTokenMetadata, TypeMetadata, getInjectMetadata, Identity } from "./reflections/metadata.ts";

type Binds = {
    [key: string]: {
        depth: number,
        get(): any
    }
}

type ScopeBinds = {                
    [key: string]: Binds
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
                if (key != "__root__") {
                    this._binds[key] = {};
                } 
                let parentBinds = parent._binds[key];
                let binds = this._binds[scope && scope == key ? "__root__" : key];         
                for (const bindKey in parentBinds) {
                    if (!binds[bindKey] || (parentBinds[bindKey].depth >= binds[bindKey].depth)) {
                        binds[bindKey] = parentBinds[bindKey];
                    }                   
                }
            }
        }

        for (const key in nonModulesMetadata) {
            if ((!scope && key == "__root__") || (scope && key == scope)) {
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
        let id = this.getId(metadata.target);

        if (metadata.token) {
            id = this.tokenFormat(id, metadata.token);
        }

        let dependencies = metadata.dependencies.map((func, index) => {
            let key = this.getId(func);
            return metadata.inject ? this.tokenFormat(key, metadata.inject[index]) : key;
        });

        if (binds[id] && binds[id].depth >= this._depth) {
            throw new Error(`Bind already defined for '${metadata.target.name}'.`);
        }
        else {
            dependencies.forEach((key, index) => {
                let root = this._binds.__root__;
                if (root[key] && (!binds[key] || (root[key].depth > binds[key].depth))) {
                    binds[key] = root[key]; 
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
            let hash = (Math.random() * 0x40000000) | 0;
            if (hash === 0) {
                hash = 1;
            }
            deninjectId = hash.toString();
            identity.__deninjectId__ = deninjectId;
        }

        return deninjectId;
    }

    public get<T>(identity: Identity<T>, token?: string): T {
        if (!identity.__deninjectId__) {
            throw new BindError(<string>identity.name);
        }
        let bind = this._binds.__root__[token ? this.tokenFormat(identity.__deninjectId__, token) : identity.__deninjectId__];

        if (!bind) {
            throw new BindError(<string>identity.name);
        }

        return bind.get();
    }

    public sub(scope: string, ...modules: any[]): SubInjector {
        return new SubInjector(scope, this, modules);
    }
}

export class Injector extends SubInjector {
    constructor(...modules: any[]) {
        super(null, null, modules);
    }
}