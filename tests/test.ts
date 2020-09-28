import { assertEquals, assert } from "testing/asserts.ts";
import * as cls from "../decorators/forClasses.ts";
import { Scope, Singleton, Token, Transient } from "../decorators/forModules.ts";
import { Inject } from "../decorators/inject.ts";
import { Injector } from "../injector.ts";
import { getScopeMetadata, getSingletonMetadata } from "../reflections/metadata.ts";

export class A {}
export class B {}
export class D {}

@cls.Singleton()
export class C {
    constructor(a: A) {
        console.log("Class C!", a);
    }
}

export class TestModule {
    @Singleton()
    public buildA(): A {
        console.log("buildA");
        return new A()
    }

    @Transient()
    public buildB(c: C): B {
        console.log("buildB: ", c);
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
        //assertEquals("scopeA", getScopeMetadata(testModule, "buildA"));
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
        const b = injector.get(B);
    },
});