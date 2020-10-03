import { assert, assertEquals, assertNotEquals, assertThrows } from "https://deno.land/std/testing/asserts.ts";
import { Transient, Scope, Singleton, Token, Inject, DynamicToken } from "../../decorators.ts";
import { dynamicToken, getArgumentsMetadata, IToken, nonModulesMetadata } from "../../reflections/metadata.ts";
import { TokenSymbol } from "../../symbols/tokenSymbol.ts";

const scopeRoot = "__root__";
const scopeA = "scopeA";

const tokenA = "tokenA";
const tokenB = new TokenSymbol(true);

@Transient()
@Scope(scopeA)
class A {}

@Singleton()
class B {}

@Transient()
class C {}

@Transient()
@Token(tokenA)
class D {}

@Transient()
class E {
    constructor(@Inject(tokenA) d: D) {
    }
}

@Transient()
@tokenB.apply()
class F {}

@Transient()
class G {
    constructor(@tokenB.inject() f: F) {
    }
}

@Transient()
class H {
    constructor(@DynamicToken() token: TokenSymbol) {
  
    }
}

Deno.test("classes transient decorator", () => {
    const typeMetadata = nonModulesMetadata[scopeRoot];
    assert(typeMetadata);
    assertNotEquals(typeMetadata.filter(m => m.target == C).length, 0);
});

Deno.test("classes singleton decorator", () => {
    const typeMetadata = nonModulesMetadata[scopeRoot];
    assert(typeMetadata);
    assertNotEquals(typeMetadata.filter(m => m.target == B && m.isSingleton).length, 0);
});

Deno.test("classes scope decorator", () => {
    const typeMetadata = nonModulesMetadata[scopeA];
    assert(typeMetadata);
    assertNotEquals(typeMetadata.filter(m => m.target == A).length, 0);
});

Deno.test("classes token decorator", () => {
    const typeMetadata = nonModulesMetadata[scopeRoot];
    assert(typeMetadata);
    assertNotEquals(typeMetadata.filter(m => m.target == D && m.token?.id == tokenA).length, 0);
});

Deno.test("classes inject decorator", () => {
    let injectMetadata = getArgumentsMetadata(E);
    assert(injectMetadata);
    if (injectMetadata) {          
        assertEquals((<IToken>injectMetadata[0])?.id, tokenA);
    }
});

Deno.test("classes inject ignoreType decorator", () => {
    let injectMetadata = getArgumentsMetadata(G);
    assert(injectMetadata);
    if (injectMetadata) {
        const token = <IToken>injectMetadata[0];
        assert(token?.ignoreType);
        assertEquals(token?.id, tokenB.id);
    }
});

Deno.test("classes dynamicToken decorator", () => {
    let injectMetadata = getArgumentsMetadata(H);
    assert(injectMetadata);
    if (injectMetadata) {          
        assertEquals(injectMetadata[0], dynamicToken);
    }
});

Deno.test("classes throws scope decorator", () => {
    assertThrows((): void => {
        @Scope(scopeA)
        @Transient()
        class Temp {}
    });

    assertThrows((): void => {
        @Scope(scopeA)
        @Singleton()
        class Temp {}
    });
});

Deno.test("classes throws token decorator", () => {
    assertThrows((): void => {
        @Token(tokenA)
        @Transient()
        class Temp {}
    });

    assertThrows((): void => {
        @Token(tokenA)
        @Singleton()
        class Temp {}
    });
});

Deno.test("classes throws dynamicToken decorator", () => {
    assertThrows((): void => {
        @Transient()
        @Token(tokenA)     
        class Temp {
            constructor(@DynamicToken() token: TokenSymbol) {
            }
        }
    });
});