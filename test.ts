import { assertEquals, assert } from "testing/asserts.ts";
import * as cls from "./classDecorators.ts";
import { Scope, Singleton, Transient } from "./moduleDecorators.ts";
import { Injector } from "./injector.ts";
import { getScopeMetadata, getSingletonMetadata } from "./metadata.ts";

export class A {}
export class B {}

@cls.Singleton()
@cls.Scope("scopeC")
export class C {
    constructor(b: B) {

    }
}

export class TestModule {
    @Singleton()
    @Scope("scopeA")

    public buildA(): A {
        return new A()
    }

    @Transient()
    @Scope("scopeB")
    public buildB(a: A): B {
        return new B()
    }
}

Deno.test({
    name: "scope and singleton decorator",
    fn() {
        const testModule = new TestModule();
        assertEquals("scopeA", getScopeMetadata(testModule, "buildA"));
        assert(getSingletonMetadata(testModule, "buildA"));
    },
});

Deno.test({
    name: "scope and transient decorator",
    fn() {
        const testModule = new TestModule();
        assertEquals("scopeB", getScopeMetadata(testModule, "buildB"));
        assert(!getSingletonMetadata(testModule, "buildB"));
    },
});

Deno.test({
    name: "injector",
    fn() {
        const testModule = new TestModule();      
        const injector = new Injector(testModule);
    },
});