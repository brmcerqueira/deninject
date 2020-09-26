import "reflection";
import { assertEquals } from "testing/asserts.ts";
import { Scope } from "./decorators.ts";

declare const Reflect: any;

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
        console.log(Reflect.getMetadata("design:type", testModule, "buildA"));
        console.log(Reflect.getMetadata("design:paramtypes", testModule, "buildA"));
        console.log(Reflect.getMetadata("design:returntype", testModule, "buildA"));
        assertEquals("[Function: A]", Reflect.getMetadata("design:returntype", testModule, "buildA"))
    },
});