import { assert, assertEquals, assertNotEquals, assertThrows } from "testing/asserts.ts";
import { Inject } from "../../decorators/inject.ts";
import { getInjectMetadata } from "../../reflections/metadata.ts";

const tokenA = "tokenA";

class A {}

class B {
    constructor(@Inject(tokenA) a: A) {
    }
}

class C {
    constructor(a: A) {
    }
}

class TestModule {
    public buildC(@Inject(tokenA) a: A): C {
        return new C(a);
    }
}

Deno.test({
    name: "classes inject decorator",
    fn() {
        let injectMetadata = getInjectMetadata(B);
        assert(injectMetadata);
        if (injectMetadata) {           
            assertEquals(injectMetadata[0], tokenA);
        }
    }
});

Deno.test({
    name: "modules inject decorator",
    fn() {
        const testModule = new TestModule();
        let injectMetadata = getInjectMetadata(testModule, "buildC");
        assert(injectMetadata);
        if (injectMetadata) {           
            assertEquals(injectMetadata[0], tokenA);
        }
    }
});