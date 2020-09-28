import { defineClassScopeMetadata, defineClassTokenMetadata, pushClassMetadata } from "../reflections/metadata.ts";

export function Scope(name: string): ClassDecorator {
    return (target: Function) => {
        defineClassScopeMetadata(target, name);      
    };
}

export function Token(name: string): ClassDecorator {
    return (target: Function) => {
        defineClassTokenMetadata(target, name);      
    };
}

export function Singleton(): ClassDecorator {
    return (target: Function) => {
        pushClassMetadata(target, true);   
    };
}

export function Transient(): ClassDecorator {
    return (target: Function) => {
        pushClassMetadata(target, false);
    };
}