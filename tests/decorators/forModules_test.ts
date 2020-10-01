import { assert, assertEquals, assertNotEquals, assertThrows } from "https://deno.land/std/testing/asserts.ts";
import { Singleton, Scope, Transient, Token, Inject } from "../../decorators.ts";
import { getInjectMetadata, getProviderMetadata, getScopeMetadata, getSingletonMetadata, getTokenMetadata } from "../../reflections/metadata.ts";

const scopeA = "scopeA";

const tokenA = "tokenA";

class A {}
class B {
    constructor(a: A) {
    }
}

class C {
    constructor(a: A) {
    }
}

class TestModule {
    @Singleton()
    @Scope(scopeA)
    public buildA(): A {
        return new A();
    }

    @Transient()
    @Scope(scopeA)
    @Token(tokenA)
    public buildB(a: A): B {
        return new B(a);
    }

    @Singleton()
    @Token(tokenA)
    public buildAToken(): A {
        return new A();
    }

    public buildC(@Inject(tokenA) a: A): C {
        return new C(a);
    }
}

Deno.test("modules transient decorator", () => {
    const testModule = new TestModule();
    assertNotEquals(getProviderMetadata(testModule).indexOf("buildB"), -1);
});

Deno.test("modules singleton decorator", () => {
    const testModule = new TestModule();
    assert(getSingletonMetadata(testModule, "buildA"));
});

Deno.test("modules scope decorator", () => {
    const testModule = new TestModule();
    assertEquals(scopeA, getScopeMetadata(testModule, "buildA"));
});

Deno.test("modules token decorator", () => {
    const testModule = new TestModule();
    assertEquals(tokenA, getTokenMetadata(testModule, "buildB")?.value);
});

Deno.test("modules inject decorator", () => {
    const testModule = new TestModule();
    let injectMetadata = getInjectMetadata(testModule, "buildC");
    assert(injectMetadata);
    if (injectMetadata) {           
        assertEquals(injectMetadata[0]?.value, tokenA);
    }
});

Deno.test("modules throws scope decorator", () => {
    assertThrows((): void => {
        class TempModule {
            @Scope(scopeA)
            @Transient()         
            public buildA(): A {
                return new A();
            }
        }
    });

    assertThrows((): void => {
        class TempModule {
            @Scope(scopeA)
            @Singleton()         
            public buildA(): A {
                return new A();
            }
        }
    });
});

Deno.test("modules throws token decorator", () => {
    assertThrows((): void => {
        class TempModule {
            @Token(tokenA)
            @Transient()         
            public buildA(): A {
                return new A();
            }
        }
    });

    assertThrows((): void => {
        class TempModule {
            @Token(tokenA)
            @Singleton()         
            public buildA(): A {
                return new A();
            }
        }
    });
});