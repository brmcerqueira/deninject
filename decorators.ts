import { defineScopeMetadata, defineClassScopeMetadata, defineTokenMetadata, defineClassTokenMetadata, defineSingletonMetadata, pushProviderMetadata, pushClassMetadata, pushInjectMetadata } from "./reflections/metadata.ts";

export type InjectDecorator = (target: any, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<any>) => void;

export function Scope(name: string): InjectDecorator {
    return (target: any, propertyKey?: string | symbol) => {
        if (propertyKey) {
            defineScopeMetadata(target, propertyKey, name); 
        } else {
            defineClassScopeMetadata(target, name);  
        }    
    };
}

export function Token(name: string): InjectDecorator {
    return (target: any, propertyKey?: string | symbol) => {
        if (propertyKey) {
            defineTokenMetadata(target, propertyKey, name);
        } else {
            defineClassTokenMetadata(target, name); 
        }
    };
}

export function Singleton(): InjectDecorator {
    return (target: any, propertyKey?: string | symbol) => {
        if (propertyKey) {
            defineSingletonMetadata(target, propertyKey);
            pushProviderMetadata(target, propertyKey); 
        } else {
            pushClassMetadata(target, true); 
        }          
    };
}

export function Transient(): InjectDecorator {
    return (target: any, propertyKey?: string | symbol) => {
        if (propertyKey) {
            pushProviderMetadata(target, propertyKey);
        } else {
            pushClassMetadata(target, false); 
        }       
    };
}

export function Inject(token: string): ParameterDecorator {
    return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
        pushInjectMetadata(target, propertyKey, parameterIndex, token);
    };
}