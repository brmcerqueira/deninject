import { getParamtypesMetadata, getProviderMetadata, getReturntypeMetadata, getScopeMetadata, getSingletonMetadata } from "./metadata.ts";

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
};

export class Injector {
    private _depth: number = 1;
    private _scopes: Scopes;

    constructor(...modules: any[]) {
        this._scopes = {
            __default__: this.createScope({})
        };
        this.putModules(modules); 
    }

    private copy(injector: Injector) {
        this._depth = injector._depth + 1;
        for (const scope in injector._scopes) {
            const injectorBinds = injector._scopes[scope].binds;
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

    private putModules(modules: any[]) {
        modules.forEach(module => {
            getProviderMetadata(module).forEach(key => {
                let scopeMetadata = getScopeMetadata(module, key);
                
                if (scopeMetadata) {
                    if (!this._scopes[scopeMetadata]) {                   
                        this._scopes[scopeMetadata] = this.createScope({});
                    }                              
                }
                else {
                    scopeMetadata = "__default__";
                }

                let scope = this._scopes[scopeMetadata];

                let isSingleton = getSingletonMetadata(module, key);
                console.log(getReturntypeMetadata(module, key)?.toString());
                console.log(getParamtypesMetadata(module, key));  
            })
        });
        console.log(this._scopes);
    }

    private createScope(binds: Binds): Scope {
        return {
            cache: {},
            binds: binds
        }
    }

    public sub(...modules: any[]): Injector {
        let injector = new Injector();      
        injector.copy(this);
        injector.putModules(modules);
        return injector;
    }
}