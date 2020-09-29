import { defineClassScopeMetadata, defineClassTokenMetadata, Identity, pushClassMetadata } from "../reflections/metadata.ts";

export function Scope(name: string): ClassDecorator {
    return (target: Function) => {
        defineClassScopeMetadata(<Identity<any>><unknown>target, name);      
    };
}

export function Token(name: string): ClassDecorator {
    return (target: Function) => {
        defineClassTokenMetadata(<Identity<any>><unknown>target, name);      
    };
}

export function Singleton(): ClassDecorator {
    return (target: Function) => {
        pushClassMetadata(<Identity<any>><unknown>target, true);   
    };
}

export function Transient(): ClassDecorator {
    return (target: Function) => {
        pushClassMetadata(<Identity<any>><unknown>target, false);
    };
}