import { assert, assertEquals, assertNotEquals, assertThrows } from "testing/asserts.ts";
import { Scope, Singleton, Token, Transient } from "../decorators/forModules.ts";
import { Injector } from "../injector.ts";

const scopeA = "scopeA";

const tokenA = "tokenA";

class A {}
class B {
    constructor(public a: A) {
    }
}
class C {
    constructor(public b: B) {
    }
}

class TestModule {
    @Singleton()
    public buildA(): A {
        return new A();
    }

    @Transient()
    public buildB(a: A): B {
        return new B(a);
    }

    @Transient()
    @Scope(scopeA)
    public buildC(b: B): C {
        return new C(b);
    }
}

Deno.test({
    name: "injector get",
    fn() {   
        const injector = new Injector(new TestModule());
        const b = injector.get(B);
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
        assert(c.b instanceof B);
        assert(c.b.a instanceof A);
    },
});