import { nonModulesMetadata, getParamtypesMetadata, getProviderMetadata, getReturntypeMetadata, getScopeMetadata, getSingletonMetadata, getTokenMetadata, TypeMetadata, getInjectMetadata, InjectMetadata } from "./metadata.ts";

export interface IInjector {
    sub(scope: string, ...modules: any[]): IInjector 
}

class SubInjector implements IInjector {
    protected _depth: number = 1;

    protected _cache: {                
        [key: string]: any
    } = {};

    protected _binds: {
        [key: string]: {
            depth: number,
            get(): any
        }
    } = {};

    protected constructor(scope: string | null, parent: SubInjector | null, modules: any[]) {
        if (parent) {
            this._depth += parent._depth;

            for (const bind in parent._binds) {
                this._binds[bind] = {
                    depth: this._depth,
                    get: parent._binds[bind].get
                }
            }
        }

        console.log(nonModulesMetadata);

        for (const key in nonModulesMetadata) {
            if (key == "__root__" || (scope && key == scope)) {
                nonModulesMetadata[key].forEach(metadata => {
                    this.buildType(metadata); 
                });
            }       
        }
        
        modules.forEach(module => {
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
                            inject: getInjectMetadata(module, key)
                        });  
                    } 
                }              
            })
        });

        console.log(this._cache);
        console.log(this._binds);
    }

    protected buildType(metadata: TypeMetadata) {
        let code = this.hashCode(metadata.target);

        if (metadata.token) {
            code = this.tokenFormat(code, metadata.token);
        }

        let dependencies = metadata.dependencies.map((func, index) => {
            let key = this.hashCode(func);
            return metadata.inject ? this.tokenFormat(key, metadata.inject[index]) : key;
        });

        if (this._binds[code] && this._binds[code].depth >= this._depth) {
            throw new Error(`Bind already defined for '${metadata.target}'.`);
        }
        else {
            dependencies.forEach((key, index) => {
                if (!this._binds[key]) {
                    this._binds[key] = {
                        depth: 0,
                        get(): any {
                            throw new Error(`Bind not found for '${metadata.dependencies[index]}'.`);
                        }
                    }
                }
            });

            let resolve = (): any => {
                return metadata.target.apply(Object.create(metadata.target.prototype), 
                dependencies.map(key => this._binds[key].get()));
            };

            this._binds[code] = {
                depth: this._depth,
                get: metadata.isSingleton ? (): any => {
                    if (this._cache[code]) {
                        return this._cache[code];
                    }
                    else {
                        let value = resolve();
                        this._cache[code] = value;
                        return value;
                    }
                } : resolve
            }
        }
    }

    private tokenFormat(code: string, token: string): string {
        return `${code}_${token}`;
    }

    private hashCode(func: Function): string {
        let value = func.toString();
        let hash = 0; 
        let length = value.length; 
        let i = 0;
    
        if (length > 0){   
            while (i < length) {  
                hash = (hash << 5) - hash + value.charCodeAt(i++) | 0;
            }
        }
    
        return hash.toString();
    }

    public sub(scope: string, ...modules: any[]): IInjector {
        return new SubInjector(scope, this, modules);
    }
}

export class Injector extends SubInjector {
    constructor(...modules: any[]) {
        super(null, null, modules);
    }
}