import { assertEquals, assert } from "testing/asserts.ts";
import * as cls from "./classDecorators.ts";
import { Scope, Singleton, Token, Transient } from "./moduleDecorators.ts";
import { Injector } from "./injector.ts";
import { getScopeMetadata, getSingletonMetadata } from "./metadata.ts";
import { Inject } from "./inject.ts";

export class A {}
export class B {}
export class D {}

@cls.Singleton()
@cls.Token("tokenC")
export class C {
    constructor(@Inject("parB") b: B) {

    }
}

export class TestModule {
    @Singleton()
    @Scope("scopeA")
    public buildA(): A {
        return new A()
    }

    @Transient()
    public buildB(@Inject("parA") a: A): B {
        return new B()
    }

    @Singleton()
    @Token("tokenD")
    public buildD(): D {
        return new D()
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