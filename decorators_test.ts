import { assertEquals, assert } from "testing/asserts.ts";
import { Scope, Singleton, Transient } from "./decorators.ts";
import { getScopeMetadata, getTransientMetadata } from "./metadata.ts";

class A {}
class B {}

class TestModule {
    @Scope("scopeA")
    @Singleton()
    public buildA(): A {
        return new A()
    }

    @Scope("scopeB")
    @Transient()
    public buildB(): B {
        return new B()
    }
}

Deno.test({
    name: "scope and singleton decorator",
    fn() {
        const testModule = new TestModule();
        assertEquals("scopeA", getScopeMetadata(testModule, "buildA"));
        assert(!getTransientMetadata(testModule, "buildA"));
    },
});

Deno.test({
    name: "scope and transient decorator",
    fn() {
        const testModule = new TestModule();
        assertEquals("scopeB", getScopeMetadata(testModule, "buildB"));
        assert(getTransientMetadata(testModule, "buildB"));
    },
});