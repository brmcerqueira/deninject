import { getMetadata, defineMetadata } from "./reflect.ts";

const designParamtypes = "design:paramtypes";
const designReturntype = "design:returntype";
const deninjectScope = "deninject:scope";
const deninjectToken = "deninject:token";
const deninjectInject = "deninject:inject";
const deninjectSingleton = "deninject:singleton";
const deninjectProvider = "deninject:provider";
const deninjectLock = "deninject:lock";

export type InjectMetadata = {
    [key: number]: string
}

export type TypeMetadata = {
    isSingleton: boolean,
    token?: string, 
    target: Function,
    create(args: any[]): any, 
    dependencies: Function[],
    inject?: InjectMetadata
}

export const nonModulesMetadata: {                
    [key: string]: TypeMetadata[]
} = {
    __root__: []
};

class ScopeError extends Error {
    constructor(target: any | string, value: string) {
       super(`Don't use 'Scope(${value})' before 'Singleton' or 'Transient' in '${typeof target == "string" ? target : target.name}'.`);
    }
}

class TokenError extends Error {
    constructor(target: any | string, value: string) {
       super(`Don't use 'Token(${value})' before 'Singleton' or 'Transient' in '${typeof target == "string" ? target : target.name}'.`);
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

export function getInjectMetadata(target: any, targetKey?: string | symbol): InjectMetadata | undefined {
    return getMetadata(deninjectInject, target, targetKey);
}

export function getProviderMetadata(target: any): (string | symbol)[] {
    return getMetadata(deninjectProvider, target) || [];
}

export function defineScopeMetadata(target: any, targetKey: string | symbol, value: string) {
    if (getMetadata(deninjectLock, target, targetKey)) {
        throw new ScopeError(targetKey, value);
    }

    defineMetadata(deninjectScope, value, target, targetKey);
}

export function defineTokenMetadata(target: any, targetKey: string | symbol, value: string) {
    if (getMetadata(deninjectLock, target, targetKey)) {
        throw new TokenError(targetKey, value);
    }

    defineMetadata(deninjectToken, value, target, targetKey);
}

export function defineClassScopeMetadata(target: any, value: string) {
    if (getMetadata(deninjectLock, target)) {
        throw new ScopeError(target, value);
    }

    defineMetadata(deninjectScope, value, target);
}

export function defineClassTokenMetadata(target: any, value: string) {
    if (getMetadata(deninjectLock, target)) {
        throw new TokenError(target, value);
    }

    defineMetadata(deninjectToken, value, target);
}

export function defineSingletonMetadata(target: any, targetKey: string | symbol) {
    defineMetadata(deninjectSingleton, true, target, targetKey);
}

export function pushInjectMetadata(target: any, targetKey: string | symbol | undefined, parameterIndex: number, value: string) {
    let injectMetadata = getInjectMetadata(target, targetKey);

    if (!injectMetadata) {
        injectMetadata = {};
        defineMetadata(deninjectInject, injectMetadata, target, targetKey);
    }

    injectMetadata[parameterIndex] = value;
}

export function pushProviderMetadata(target: any, targetKey: string | symbol) {
    let providers: (string | symbol)[] | undefined = getMetadata(deninjectProvider, target);
    if (providers) {
        if (providers.indexOf(targetKey) > 0) {
            throw new Error(`Don't use 'Singleton' and 'Transient' at same time in '${targetKey.toString()}'.`);
        }
    }
    else {
        providers = [];
        defineMetadata(deninjectProvider, providers, target);
    }

    providers.push(targetKey);
    defineMetadata(deninjectLock, true, target, targetKey);
}

export function pushClassMetadata(target: Function, isSingleton: boolean) {
    let scope: string | undefined = getMetadata(deninjectScope, target);

    if (scope) {
        nonModulesMetadata[scope] = [];
    }
    else {
        scope = "__root__";
    }

    nonModulesMetadata[scope].push({
        isSingleton: isSingleton,
        token: getMetadata(deninjectToken, target),
        target: target,
        dependencies: getMetadata(designParamtypes, target) || [],
        inject: getInjectMetadata(target),
        create(args: any[]): any {
            let constructor: ObjectConstructor = target.prototype.constructor;
            return new constructor(args);
        }
    }); 

    defineMetadata(deninjectLock, true, target);
}