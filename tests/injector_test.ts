import { assert, assertEquals, assertNotEquals, assertThrows } from "testing/asserts.ts";
import { Scope, Singleton, Token, Transient } from "../decorators/forModules.ts";
import { Injector } from "../injector.ts";

const scopeA = "scopeA";

const tokenA = "tokenA";

abstract class AbstractB {
    constructor(public a: A) {
        
    }
}

class A {}
class B extends AbstractB {
    constructor(a: A) {
        super(a);
    }
}
class C {
    constructor(public b: AbstractB) {
    }
}

class TestModule {
    @Singleton()
    public buildA(): A {
        return new A();
    }

    @Transient()
    public buildB(a: A): AbstractB {
        return new B(a);
    }

    @Transient()
    @Scope(scopeA)
    public buildC(b: AbstractB): C {
        return new C(b);
    }
}

Deno.test({
    name: "injector get",
    fn() {   
        const injector = new Injector(new TestModule());
        const b = injector.get(AbstractB);
        assert(b instanceof B);
        assert(b.a instanceof A);
    },
});

Deno.test({
    name: "subinjector get",
    fn() {   
        const injector = new Injector(new TestModule());
        const subInjector = injector.sub(scopeA);
        const c = subInjector.get(C);
        assert(c instanceof C);
        assert(c.b instanceof B);
        assert(c.b.a instanceof A);
    },
});