import { defineScopeMetadata, defineSingletonMetadata, defineTokenMetadata, pushProviderMetadata } from "../reflections/metadata.ts";

export function Scope(name: string): MethodDecorator {
    return (target: Object, propertyKey: string | symbol) => {
        defineScopeMetadata(target, propertyKey, name);      
    };
}

export function Token(name: string): MethodDecorator {
    return (target: Object, propertyKey: string | symbol) => {
        defineTokenMetadata(target, propertyKey, name);      
    };
}

export function Singleton(): MethodDecorator {
    return (target: Object, propertyKey: string | symbol) => {
        defineSingletonMetadata(target, propertyKey);
        pushProviderMetadata(target, propertyKey);   
    };
}

export function Transient(): MethodDecorator {
    return (target: Object, propertyKey: string | symbol) => {
        pushProviderMetadata(target, propertyKey);
    };
}