import { defineScopeMetadata, defineClassScopeMetadata, defineTokenMetadata, defineClassTokenMetadata, defineSingletonMetadata, pushProviderMetadata, pushClassMetadata, pushInjectMetadata } from "./reflections/metadata.ts";

export type DeninjectDecorator = (target: any, propertyKey?: string | symbol) => void;

export function defineScope(target: any, name: string, propertyKey?: string | symbol) {
    if (propertyKey) {
        defineScopeMetadata(target, propertyKey, name); 
    } else {
        defineClassScopeMetadata(target, name);  
    }   
}

export function defineToken(target: any, value: string, propertyKey?: string | symbol, 
    ignoreType: boolean = false) {
    let token = {
        ignoreType: ignoreType,
        value: value
    };
    if (propertyKey) {
        defineTokenMetadata(target, propertyKey, token);
    } else {
        defineClassTokenMetadata(target, token); 
    }
}

export function defineSingleton(target: any, propertyKey?: string | symbol) {
    if (propertyKey) {
        defineSingletonMetadata(target, propertyKey);
        pushProviderMetadata(target, propertyKey); 
    } else {
        pushClassMetadata(target, true); 
    }  
}

export function defineTransient(target: any, propertyKey?: string | symbol) {
    if (propertyKey) {
        pushProviderMetadata(target, propertyKey);
    } else {
        pushClassMetadata(target, false); 
    }
}

export function defineInject(target: Object, propertyKey: string | symbol, 
    parameterIndex: number, token: string, ignoreType: boolean = false) {
    pushInjectMetadata(target, propertyKey, parameterIndex, {
        ignoreType: ignoreType,
        value: token
    });
}

export function Scope(name: string): DeninjectDecorator {
    return (target: any, propertyKey?: string | symbol) => {
        defineScope(target, name, propertyKey);    
    };
}

export function Token(name: string, ignoreType: boolean = false): DeninjectDecorator {
    return (target: any, propertyKey?: string | symbol) => {
        defineToken(target, name, propertyKey, ignoreType); 
    };
}

export function Singleton(): DeninjectDecorator {
    return (target: any, propertyKey?: string | symbol) => {
        defineSingleton(target, propertyKey);          
    };
}

export function Transient(): DeninjectDecorator {
    return (target: any, propertyKey?: string | symbol) => {
        defineTransient(target, propertyKey);      
    };
}

export function Inject(token: string, ignoreType: boolean = false): ParameterDecorator {
    return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
        defineInject(target, propertyKey, parameterIndex, token, ignoreType);
    };
}