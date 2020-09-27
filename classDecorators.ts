import { defineClassScopeMetadata, pushClassMetadata } from "./metadata.ts";

export function Scope(name: string): ClassDecorator {
    return (target: Object) => {
        defineClassScopeMetadata(target, name);      
    };
}

export function Singleton(): ClassDecorator {
    return (target: Object) => {
        pushClassMetadata(target, true);   
    };
}

export function Transient(): ClassDecorator{
    return (target: Object) => {
        pushClassMetadata(target, false);
    };
}