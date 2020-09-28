import { assert, assertNotEquals } from "testing/asserts.ts";
import { Scope, Singleton, Token, Transient } from "../../decorators/forClasses.ts";
import { nonModulesMetadata } from "../../reflections/metadata.ts";

const scopeRoot = "__root__";
const scopeA = "scopeA";

const tokenA = "tokenA";

@Transient()
@Scope(scopeA)
class ClassesScopeDecoratorA {}

@Singleton()
class ClassesScopeDecoratorB {}

@Transient()
class ClassesScopeDecoratorC {}

@Transient()
@Token(tokenA)
class ClassesScopeDecoratorD {}

Deno.test({
    name: "classes scope decorator",
    fn() {
        const typeMetadata = nonModulesMetadata[scopeA];
        assert(typeMetadata);
        assertNotEquals(typeMetadata.filter(m => m.target == ClassesScopeDecoratorA).length, 0);
    }
});

Deno.test({
    name: "classes singleton decorator",
    fn() {
        const typeMetadata = nonModulesMetadata[scopeRoot];
        assert(typeMetadata);
        assertNotEquals(typeMetadata.filter(m => m.target == ClassesScopeDecoratorB && m.isSingleton).length, 0);
    }
});

Deno.test({
    name: "classes transient decorator",
    fn() {
        const typeMetadata = nonModulesMetadata[scopeRoot];
        assert(typeMetadata);
        assertNotEquals(typeMetadata.filter(m => m.target == ClassesScopeDecoratorC).length, 0);
    }
});

Deno.test({
    name: "classes token decorator",
    fn() {
        const typeMetadata = nonModulesMetadata[scopeRoot];
        assert(typeMetadata);
        assertNotEquals(typeMetadata.filter(m => m.target == ClassesScopeDecoratorD && m.token == tokenA).length, 0);
    }
});