import { defineScopeMetadata, defineTransientMetadata } from "./metadata.ts";

export function Scope(name: string): MethodDecorator {
    return (target: Object, propertyKey: string | symbol) => {
        defineScopeMetadata(target, propertyKey, name);
    };
}

export function Singleton(): MethodDecorator {
    return (target: Object, propertyKey: string | symbol) => {
        defineTransientMetadata(target, propertyKey, false);
    };
}

export function Transient(): MethodDecorator {
    return (target: Object, propertyKey: string | symbol) => {
        defineTransientMetadata(target, propertyKey, true);
    };
}