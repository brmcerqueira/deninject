import { nonModulesMetadata, getParamtypesMetadata, getProviderMetadata, getReturntypeMetadata, getScopeMetadata, getSingletonMetadata, getTokenMetadata, TypeMetadata, getInjectMetadata } from "./reflections/metadata.ts";

export interface Newable<T> {
    new (...args: any[]): T;
    __deninjectId__?: string
}
  
export interface Abstract<T> {
    prototype: T;
    __deninjectId__?: string
}
  
export type Identity<T> = Newable<T> | Abstract<T>;

export interface IInjector {
    get<T>(identity: Identity<T>): T;
    sub(scope: string, ...modules: any[]): IInjector 
}

class BindError extends Error {
    constructor(identity: any) {
       super(`Bind not found for '${identity.name}'.`);
    }
}

class SubInjector implements IInjector {
    private _depth: number = 1;

    private _cache: {                
        [key: string]: any
    } = {};

    private _binds: {
        [key: string]: {
            depth: number,
            get(): any
        }
    } = {};

    protected constructor(scope: string | null, parent: SubInjector | null, private _modules: any[]) {
        if (parent) {
            this._depth += parent._depth;

            for (const key in parent._binds) {
                let bind = parent._binds[key];
                this._binds[key] = {
                    depth: bind.depth,
                    get: bind.get
                }
            }
        }

        for (const key in nonModulesMetadata) {
            if (key == "__root__" || (scope && key == scope)) {
                nonModulesMetadata[key].forEach(metadata => {
                    this.buildType(metadata); 
                });
            }       
        }
        
        _modules.forEach(module => {
            getProviderMetadata(module).forEach(key => {    
                let scopeMetadata = getScopeMetadata(module, key);        
                if (scopeMetadata == undefined || (scope && scopeMetadata == scope)) {
                    let returntype = getReturntypeMetadata(module, key);
                    if (returntype) {
                        this.buildType({
                            isSingleton: getSingletonMetadata(module, key),
                            token: getTokenMetadata(module, key),
                            target: returntype,
                            dependencies: getParamtypesMetadata(module, key),
                            inject: getInjectMetadata(module, key),
                            create(args: any[]): any {
                                let func: Function = module[key];
                                return func.apply(module, args);
                            }
                        });  
                    } 
                }              
            })
        });
    }

    private buildType(metadata: TypeMetadata) {
        let id = this.getId(metadata.target);

        if (metadata.token) {
            id = this.tokenFormat(id, metadata.token);
        }

        let dependencies = metadata.dependencies.map((func, index) => {
            let key = this.getId(func);
            return metadata.inject ? this.tokenFormat(key, metadata.inject[index]) : key;
        });

        if (this._binds[id] && this._binds[id].depth >= this._depth) {
            throw new Error(`Bind already defined for '${(<any>metadata.target).name}'.`);
        }
        else {
            dependencies.forEach((key, index) => {
                if (!this._binds[key]) {
                    this._binds[key] = {
                        depth: 0,
                        get(): any {
                            throw new BindError(metadata.dependencies[index]);
                        }
                    }
                }
            });

            let resolve = (): any => {
                return metadata.create(dependencies.map(key => this._binds[key].get()));
            };

            this._binds[id] = {
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
            throw new BindError(identity);
        }
 
        let bind = this._binds[token ? this.tokenFormat(identity.__deninjectId__, token) : identity.__deninjectId__];

        if (!bind) {
            throw new BindError(identity);
        }

        return bind.get();
    }

    public sub(scope: string, ...modules: any[]): IInjector {
        return new SubInjector(scope, this, [...this._modules, ...modules]);
    }
}

export class Injector extends SubInjector {
    constructor(...modules: any[]) {
        super(null, null, modules);
    }
}