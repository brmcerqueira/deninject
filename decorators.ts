import { defineScopeMetadata } from "./metadata.ts";

export function Scope(name: string): MethodDecorator {
    return (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor => {
        defineScopeMetadata(target, propertyKey, name);
        return descriptor;
    };
}

export function Singleton(): MethodDecorator {
    return (target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>) => {

    };
}

export function Transient(): MethodDecorator {
    return (target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>) => {

    };
}