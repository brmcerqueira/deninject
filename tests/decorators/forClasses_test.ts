import { assert, assertNotEquals, assertThrows } from "https://deno.land/std/testing/asserts.ts";
import { Transient, Scope, Singleton, Token } from "../../decorators.ts";
import { nonModulesMetadata } from "../../reflections/metadata.ts";

const scopeRoot = "__root__";
const scopeA = "scopeA";

const tokenA = "tokenA";

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

Deno.test({
    name: "classes transient decorator",
    fn() {
        const typeMetadata = nonModulesMetadata[scopeRoot];
        assert(typeMetadata);
        assertNotEquals(typeMetadata.filter(m => m.target == C).length, 0);
    }
});

Deno.test({
    name: "classes singleton decorator",
    fn() {
        const typeMetadata = nonModulesMetadata[scopeRoot];
        assert(typeMetadata);
        assertNotEquals(typeMetadata.filter(m => m.target == B && m.isSingleton).length, 0);
    }
});

Deno.test({
    name: "classes scope decorator",
    fn() {
        const typeMetadata = nonModulesMetadata[scopeA];
        assert(typeMetadata);
        assertNotEquals(typeMetadata.filter(m => m.target == A).length, 0);
    }
});

Deno.test({
    name: "classes token decorator",
    fn() {
        const typeMetadata = nonModulesMetadata[scopeRoot];
        assert(typeMetadata);
        assertNotEquals(typeMetadata.filter(m => m.target == D && m.token == tokenA).length, 0);
    }
});

Deno.test({
    name: "classes throws scope decorator",
    fn() {
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
    }
});

Deno.test({
    name: "classes throws token decorator",
    fn() {
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
    }
});