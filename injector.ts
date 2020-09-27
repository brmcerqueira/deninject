import { getParamtypesMetadata, getProviderMetadata, getReturntypeMetadata, getScopeMetadata, getSingletonMetadata } from "./metadata.ts";
import { defaultTypeMetadatas, TypeMetadata } from "./typeMetadata.ts";

type Bind = {
    depth: number,
    get(): any
}

type Binds = {
    [key: string]: Bind
}  

type Scope = {
    cache: {                
        [key: string]: any
    },
    binds: Binds          
}

type Scopes = { 
    [key: string]: Scope
}

export interface IInjector {
    sub(...modules: any[]): IInjector 
}

class SubInjector implements IInjector {
    protected _depth: number = 1;
    protected _scopes: Scopes = {
        __default__: this.createScope({})
    };

    protected constructor(parent: SubInjector | null, modules: any[]) {
        if (parent) {
            this._depth += parent._depth;
            for (const scope in parent._scopes) {
                const injectorBinds = parent._scopes[scope].binds;
                let binds: Binds = {}
    
                for (const bind in injectorBinds) {
                    binds[bind] = {
                        depth: this._depth,
                        get: injectorBinds[bind].get
                    }
                }
    
                this._scopes[scope] = this.createScope(binds)
            }
        }
        else {
            defaultTypeMetadatas.forEach(this.buildType);
        }
        
        modules.forEach(module => {
            getProviderMetadata(module).forEach(key => {
                let returntype = getReturntypeMetadata(module, key);
                if (returntype) {
                    this.buildType({
                        scope: getScopeMetadata(module, key),
                        isSingleton: getSingletonMetadata(module, key),
                        target: returntype,
                        dependencies: getParamtypesMetadata(module, key)
                    });  
                }         
            })
        });

        console.log(this._scopes);
    }

    protected buildType(metadata: TypeMetadata) {     
        let metadataScope = metadata.scope;         
        if (metadataScope) {
            if (!this._scopes[metadataScope]) {                   
                this._scopes[metadataScope] = this.createScope({});
            }                              
        }
        else {
            metadataScope = "__default__";
        }

        let scope = this._scopes[metadataScope];

        console.log(this.hashCode(metadata.target));
        console.log(metadata.dependencies);  
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

    private createScope(binds: Binds): Scope {
        return {
            cache: {},
            binds: binds
        }
    }

    public sub(...modules: any[]): IInjector {
        return new SubInjector(this, modules);
    }
}

export class Injector extends SubInjector {
    constructor(...modules: any[]) {
        super(null, modules);
    }
}