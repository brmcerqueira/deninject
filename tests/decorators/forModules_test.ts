import { assert, assertEquals, assertNotEquals, assertThrows } from "https://deno.land/std/testing/asserts.ts";
import { Singleton, Scope, Transient, Token } from "../../decorators.ts";
import { getProviderMetadata, getScopeMetadata, getSingletonMetadata, getTokenMetadata } from "../../reflections/metadata.ts";

const scopeA = "scopeA";

const tokenA = "tokenA";

class A {}
class B {
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
}

Deno.test({
    name: "modules transient decorator",
    fn() {
        const testModule = new TestModule();
        assertNotEquals(getProviderMetadata(testModule).indexOf("buildB"), -1);
    }
});

Deno.test({
    name: "modules singleton decorator",
    fn() {
        const testModule = new TestModule();
        assert(getSingletonMetadata(testModule, "buildA"));
    }
});

Deno.test({
    name: "modules scope decorator",
    fn() {
        const testModule = new TestModule();
        assertEquals(scopeA, getScopeMetadata(testModule, "buildA"));
    }
});

Deno.test({
    name: "modules token decorator",
    fn() {
        const testModule = new TestModule();
        assertEquals(tokenA, getTokenMetadata(testModule, "buildB"));
    }
});

Deno.test({
    name: "modules throws scope decorator",
    fn() {
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
    }
});

Deno.test({
    name: "modules throws token decorator",
    fn() {
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
    }
});