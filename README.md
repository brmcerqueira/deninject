# Deninject

A dependency injection module for Deno.

Available at Deno Land: [Deninject](https://deno.land/x/deninject) 

## Contents
- [Injector](#injector)
- [Decorators](#decorators)
  - [Transient](#transient)
  - [Singleton](#singleton)
  - [Scope](#scope)
  - [Token](#token)
- [Setup](#setup)

## Injector

The main feature of this module is the `Injector`. This is a class that contains all the dependencies and will be resolvable based on the settings of the injection modules using some specific decorators. Let's see a simple example:

```ts
import { Injector, modules } from "https://deno.land/x/deninject/mod.ts"; 
import Singleton = modules.Singleton;
import Transient = modules.Transient;

class ClassA {
    constructor() {
        console.log("buildA");
    }
}

class ClassB {
    constructor(a: ClassA) {
        console.log("buildB: ", a);
    }
}

class MyModule {
    @Singleton()
    public buildA(): ClassA {
        return new ClassA();
    }

    @Transient()
    public buildB(a: ClassA): ClassB {
        return new ClassB(a);
    }
}

const injector = new Injector(new MyModule());
const b = injector.get(ClassB);
```

## Decorators

The decorators are responsible for making all the configuration of the dependencies. Below are their definitions:

### Transient

The decorator 'Transient' serves to mark a class or method of a module as a transient, this means that the 'Injector' will generate a new instance for each request.

As a class:
```ts
@Transient()
class ClassA {}
```

As a module:
```ts
class ClassA {}

class MyModule {
    @Transient()
    public buildA(): ClassA {
        return new ClassA();
    }
}
```

### Singleton

The decorator 'Singleton' serves to mark a class or method of a module as a singleton, this means that the 'Injector' will generate just one instance and store it in the cache, each request will return the same instance.

As a class:
```ts
@Singleton()
class ClassA {}
```

As a module:
```ts
class ClassA {}

class MyModule {
    @Singleton()
    public buildA(): ClassA {
        return new ClassA();
    }
}
```

### Scope

The decorator 'Scope' is used to mark a class or method of a module with a specific scope, this is useful for specific configurations for the 'SubInjectors'. Every 'SubInjector' works with a specific scope.

As a class:
```ts
@Transient()
@Scope("scopeA")
class ClassA {}
```

As a module:
```ts
class ClassA {}

class MyModule {
    @Transient()
    @Scope("scopeA")
    public buildA(): ClassA {
        return new ClassA();
    }
}
```

To use a 'SubInjector':
```ts
const subInjector = injector.sub("scopeA");
const a = subInjector.get(ClassA);
```

### Token

The 'Token' decorator is used to mark a class or method of a module with a specific token, this is useful for creating different constructors for the same class.

As a class:
```ts
@Transient()
@Token("tokenA")
class ClassA {}
```

As a module:
```ts
class ClassA {}

class MyModule {
    @Transient()
    @Token("tokenA")
    public buildA(): ClassA {
        return new ClassA();
    }
}
```

To retrieve an instance:
```ts
const a = injector.get(ClassA, "tokenA");
```

To inject a specific instance using a token:
```ts
class ClassB {
    constructor(@Inject("tokenA") a: ClassA) {}
}
```

## Setup

This modules requires the following options to be set in the tsconfig:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```