import { defaultTypeMetadatas, getParamtypesMetadata, getProviderMetadata, getReturntypeMetadata, getScopeMetadata, getSingletonMetadata, TypeMetadata } from "./metadata.ts";

type Bind = {
    depth: number,
    get(): any
}

type Binds = {
    [key: string]: Bind
}  

export interface IInjector {
    sub(...modules: any[]): IInjector 
}

class SubInjector implements IInjector {
    protected _depth: number = 1;

    protected _cache: {                
        [key: string]: any
    } = {};

    protected _binds: Binds = {};

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

        console.log(defaultTypeMetadatas);

        for (const key in defaultTypeMetadatas) {
            if (key == "__root__" || (scope && key == scope)) {
                defaultTypeMetadatas[key].forEach(metadata => {
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
                            target: returntype,
                            dependencies: getParamtypesMetadata(module, key)
                        });  
                    } 
                }              
            })
        });

        console.log(this._cache);
        console.log(this._binds);
    }

    protected buildType(metadata: TypeMetadata) {
        console.log(this.hashCode(metadata.target));
        console.log(metadata.dependencies.map(this.hashCode));  
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