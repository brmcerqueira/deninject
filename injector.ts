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

export class Injector {
    private _depth: number = 1;
    private _scopes: { 
        [key: string]: Scope
    };

    constructor(...modules: any[]) {
        this.putModules(modules);
    }

    private copy(injector: Injector) {
        this._depth = injector._depth + 1;
        this._scopes = {};
        for (const scope in injector._scopes) {
            const injectorBinds = injector._scopes[scope].binds;
            let binds: Binds = {}

            for (const bind in injectorBinds) {
                binds[bind] = {
                    depth: this._depth,
                    get: injectorBinds[bind].get
                }
            }

            this._scopes[scope] = {
                cache: {},
                binds: binds
            }
        }
    }

    private putModules(...modules: any[]) {
        this._scopes = this._scopes || {};
    }

    public sub(...modules: any[]): Injector {
        let injector = new Injector();      
        injector.copy(this);
        injector.putModules(modules);
        return injector;
    }
}