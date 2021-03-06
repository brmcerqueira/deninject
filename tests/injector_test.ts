import { assert, assertEquals, assertStrictEquals, assertThrows } from "https://deno.land/std/testing/asserts.ts";
import { Singleton, Transient, Token, Inject, DynamicToken } from "../decorators.ts";
import { Injector } from "../injector.ts";
import { ScopeSymbol } from "../symbols/scopeSymbol.ts";
import { TokenSymbol } from "../symbols/tokenSymbol.ts";

const scopeA = new ScopeSymbol();

const tokenA = new TokenSymbol();
const tokenB = "tokenB";
const tokenC = new TokenSymbol(true);

abstract class AbstractClass {
    constructor(public a: A) {
        
    }
}

abstract class DynamicAbstractClass {
    constructor(public a: A) {
        
    }
}

class A {}
class B extends AbstractClass {
    constructor(a: A) {
        super(a);
    }
}
class C {
    constructor(public ac: AbstractClass) {
    }
}

class D extends AbstractClass {
    constructor(a: A) {
        super(a);
    }
}

class E {
    constructor(public ac: AbstractClass) {
    }
}

class F extends AbstractClass {
    constructor(a: A) {
        super(a);
    }
}

class TestModule {
    @Singleton()
    public buildA(): A {
        return new A();
    }

    @Transient()
    @tokenA.apply()
    public buildB(a: A): AbstractClass {
        return new B(a);
    }

    @Transient()
    @scopeA.apply()
    public buildC(@tokenA.inject() ac: AbstractClass): C {
        return new C(ac);
    }

    @Transient()
    @Token(tokenB)
    public buildD(a: A): AbstractClass {
        return new D(a);
    }

    @Transient()
    public buildE(@Inject(tokenB) ac: AbstractClass): E {
        return new E(ac);
    }

    @Transient()
    @tokenC.apply()
    public buildDtokenC(a: A): AbstractClass {
        return new D(a);
    }

    @Transient()
    public buildDynamicAbstractClass(@DynamicToken() token: TokenSymbol, a: A): DynamicAbstractClass {
        assertEquals(token, tokenA);
        return new F(a);
    }
}

Deno.test("injector get", () => {
    const injector = new Injector(new TestModule());
    const ac = injector.get(AbstractClass, tokenA);
    assert(ac instanceof B);
    assert(ac.a instanceof A);
});

Deno.test("injector get dynamicToken", () => {
    const injector = new Injector(new TestModule());
    const ac = injector.get(DynamicAbstractClass, tokenA);
    assert(ac instanceof F);
    assert(ac.a instanceof A);
});

Deno.test("injector getByToken", () => {
    const injector = new Injector(new TestModule());
    const ac = injector.getByToken(tokenC);
    assert(ac instanceof D);
    assert(ac.a instanceof A);
});

Deno.test("subinjector get", () => {
    const injector = new Injector(new TestModule());
    const subInjector = injector.sub(scopeA);
    const c = subInjector.get(C);
    assert(c instanceof C);
    assert(c.ac instanceof B);
    assert(c.ac.a instanceof A);
});

Deno.test("injector singleton get", () => {
    const injector = new Injector(new TestModule());
    const a = injector.get(A);
    assert(a instanceof A);
    assertStrictEquals(a, injector.get(A));
});

Deno.test("injector transient get", () => {
    const injector = new Injector(new TestModule());
    const ac = injector.get(AbstractClass, tokenA);
    assert(ac instanceof AbstractClass);
    assert(ac !== injector.get(AbstractClass, tokenA));
});

Deno.test("injector throws get", () => {
    assertThrows((): void => {
        class Temp {}

        const injector = new Injector(new TestModule());
        const temp = injector.get(Temp);
    });
});

Deno.test("injector throws out scope", () => {
    assertThrows((): void => {
        const injector = new Injector(new TestModule());
        const c = injector.get(C);
    });
});