import { getMetadata, defineMetadata } from "./reflect.ts";

const designParamtypes = "design:paramtypes";
const designReturntype = "design:returntype";
const deninjectScope = "deninject:scope";
const deninjectToken = "deninject:token";
const deninjectSingleton = "deninject:singleton";
const deninjectProvider = "deninject:provider";
const deninjectLock = "deninject:lock";

export type TypeMetadata = {
    isSingleton: boolean,
    token?: string, 
    target: Function, 
    dependencies: Function[]
}

export const defaultTypeMetadatas: {                
    [key: string]: TypeMetadata[]
} = {
    __root__: []
};

class ScopeError extends Error {
    constructor(name: string, value: string) {
       super(`Don't use 'Scope(${value})' before 'Singleton' or 'Transient' in '${name}'.`);
    }
}

class TokenError extends Error {
    constructor(name: string, value: string) {
       super(`Don't use 'Token(${value})' before 'Singleton' or 'Transient' in '${name}'.`);
    }
}

export function getParamtypesMetadata(target: any, targetKey: string | symbol): Function[] {
    return getMetadata(designParamtypes, target, targetKey) || [];
}

export function getReturntypeMetadata(target: any, targetKey: string | symbol): Function | null {
    return getMetadata(designReturntype, target, targetKey) || null;
}

export function getScopeMetadata(target: any, targetKey: string | symbol): string | undefined {
    return getMetadata(deninjectScope, target, targetKey);
}

export function getTokenMetadata(target: any, targetKey: string | symbol): string | undefined {
    return getMetadata(deninjectToken, target, targetKey);
}

export function getSingletonMetadata(target: any, targetKey: string | symbol): boolean {
    return getMetadata(deninjectSingleton, target, targetKey) || false;
}

export function getProviderMetadata(target: any): (string | symbol)[] {
    return getMetadata(deninjectProvider, target) || [];
}

export function defineScopeMetadata(target: any, targetKey: string | symbol, value: string) {
    if (getMetadata(deninjectLock, target, targetKey)) {
        throw new ScopeError(targetKey.toString(), value);
    }

    defineMetadata(deninjectScope, value, target, targetKey);
}

export function defineTokenMetadata(target: any, targetKey: string | symbol, value: string) {
    if (getMetadata(deninjectLock, target, targetKey)) {
        throw new TokenError(targetKey.toString(), value);
    }

    defineMetadata(deninjectToken, value, target, targetKey);
}

export function defineClassScopeMetadata(target: any, value: string) {
    if (getMetadata(deninjectLock, target)) {
        throw new ScopeError(target.toString(), value);
    }

    defineMetadata(deninjectScope, value, target);
}

export function defineClassTokenMetadata(target: any, value: string) {
    if (getMetadata(deninjectLock, target)) {
        throw new TokenError(target.toString(), value);
    }

    defineMetadata(deninjectToken, value, target);
}

export function defineSingletonMetadata(target: any, targetKey: string | symbol) {
    defineMetadata(deninjectSingleton, true, target, targetKey);
}

export function pushProviderMetadata(target: any, targetKey: string | symbol) {
    let providers: (string | symbol)[] | undefined = getMetadata(deninjectProvider, target);
    if (providers) {
        if (providers.indexOf(targetKey) > 0) {
            throw new Error(`Don't use 'Singleton' and 'Transient' at same time in '${String(targetKey)}'.`);
        }
    }
    else {
        providers = [];
        defineMetadata(deninjectProvider, providers, target);
    }

    providers.push(targetKey);
    defineMetadata(deninjectLock, true, target, targetKey);
}

export function pushClassMetadata(target: any, isSingleton: boolean) {
    let scope: string | undefined = getMetadata(deninjectScope, target);

    if (scope) {
        defaultTypeMetadatas[scope] = [];
    }
    else {
        scope = "__root__";
    }

    defaultTypeMetadatas[scope].push({
        isSingleton: isSingleton,
        token: getMetadata(deninjectToken, target),
        target: target,
        dependencies: getMetadata(designParamtypes, target) || []
    }); 

    defineMetadata(deninjectLock, true, target);
}