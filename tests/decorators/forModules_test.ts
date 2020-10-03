import { assert, assertEquals, assertNotEquals, assertThrows } from "https://deno.land/std/testing/asserts.ts";
import { Singleton, Scope, Transient, Token, Inject, DynamicToken } from "../../decorators.ts";
import { dynamicToken, getArgumentsMetadata, getProviderMetadata, getScopeMetadata, getSingletonMetadata, getTokenMetadata, IToken } from "../../reflections/metadata.ts";
import { TokenSymbol } from "../../symbols/tokenSymbol.ts";

const scopeA = "scopeA";

const tokenA = "tokenA";
const tokenB = new TokenSymbol(true);

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

    @Singleton()
    @tokenB.apply()
    public buildATokenB(): A {
        return new A();
    }

    @Transient()
    public buildCTokenB(@tokenB.inject() a: A): C {
        return new C(a);
    }

    @Transient()
    public buildBDynamicToken(@DynamicToken() token: TokenSymbol, a: A): B {
        return new B(a);
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
    assertEquals(tokenA, getTokenMetadata(testModule, "buildB")?.id);
});

Deno.test("modules inject decorator", () => {
    const testModule = new TestModule();
    let injectMetadata = getArgumentsMetadata(testModule, "buildC");
    assert(injectMetadata);
    if (injectMetadata) {           
        assertEquals((<IToken>injectMetadata[0])?.id, tokenA);
    }
});

Deno.test("modules inject ignoreType decorator", () => {
    const testModule = new TestModule();
    let injectMetadata = getArgumentsMetadata(testModule, "buildCTokenB");
    assert(injectMetadata);
    if (injectMetadata) {  
        const token = <IToken>injectMetadata[0];
        assert(token?.ignoreType);         
        assertEquals(token?.id, tokenB.id);
    }
});

Deno.test("modules dynamicToken decorator", () => {
    const testModule = new TestModule();
    let injectMetadata = getArgumentsMetadata(testModule, "buildBDynamicToken");
    assert(injectMetadata);
    if (injectMetadata) {           
        assertEquals(injectMetadata[0], dynamicToken);
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

Deno.test("modules throws dynamicToken decorator", () => {
    assertThrows((): void => {
        class TempModule {
            @Transient()
            @Token(tokenA)                
            public buildA(@DynamicToken() token: TokenSymbol): A {
                return new A();
            }
        }
    });
});