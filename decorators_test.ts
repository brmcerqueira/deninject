import { assertEquals } from "testing/asserts.ts";
import { Scope } from "./decorators.ts";
import { getScopeMetadata } from "./metadata.ts";

class A {}

class TestModule {
    @Scope("scopeA")
    public buildA(): A {
        return new A()
    }
}

Deno.test({
    name: "scope decorator test",
    fn() {
        const testModule = new TestModule();
        assertEquals("scopeA", getScopeMetadata(testModule, "buildA"))
    },
});