import { getMetadata, defineMetadata } from "./reflect.ts";

const designParamtypes = "design:paramtypes";
const designReturntype = "design:returntype";
const deninjectScope = "deninject:scope";
const deninjectToken = "deninject:token";
const deninjectInject = "deninject:inject";
const deninjectSingleton = "deninject:singleton";
const deninjectProvider = "deninject:provider";
const deninjectLock = "deninject:lock";

export const root = "__root__";
export const dynamicToken = Symbol();

export type Identity<T> = {
    prototype: T;
    name?: string,
    __deninjectId__?: string
}

export interface IToken {
    ignoreType: boolean,
    id: string
}

export type ArgumentMetadataValue = IToken | symbol;

export type InjectMetadata = {
    [key: number]: ArgumentMetadataValue
}

export type TypeMetadata = {
    isSingleton: boolean,
    token?: IToken, 
    target: Identity<any>,
    create(args: any[]): any, 
    dependencies: Identity<any>[],
    inject?: InjectMetadata
}

export const nonModulesMetadata: {                
    [key: string]: TypeMetadata[]
} = {
    __root__: []
};

class ScopeError extends Error {
    constructor(target: string, value: string) {
       super(`Don't use 'Scope(${value})' before 'Singleton' or 'Transient' in '${target}'.`);
    }
}

class TokenError extends Error {
    constructor(target: string, value: IToken) {
       super(`Don't use 'Token(${value.toString()})' before 'Singleton' or 'Transient' in '${target}'.`);
    }
}

export function getParamtypesMetadata(target: any, targetKey: string | symbol): Identity<any>[] {
    return getMetadata(designParamtypes, target, targetKey) || [];
}

export function getReturntypeMetadata(target: any, targetKey: string | symbol): Identity<any> | null {
    return getMetadata(designReturntype, target, targetKey) || null;
}

export function getScopeMetadata(target: any, targetKey: string | symbol): string | undefined {
    return getMetadata(deninjectScope, target, targetKey);
}

export function getTokenMetadata(target: any, targetKey: string | symbol): IToken | undefined {
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
        throw new ScopeError(targetKey.toString(), value);
    }

    defineMetadata(deninjectScope, value, target, targetKey);
}

export function defineTokenMetadata(target: any, targetKey: string | symbol, token: IToken) {
    if (getMetadata(deninjectLock, target, targetKey)) {
        throw new TokenError(targetKey.toString(), token);
    }

    defineMetadata(deninjectToken, token, target, targetKey);
}

export function defineClassScopeMetadata(target: Identity<any>, value: string) {
    if (getMetadata(deninjectLock, target)) {
        throw new ScopeError(<string>target.name, value);
    }

    defineMetadata(deninjectScope, value, target);
}

export function defineClassTokenMetadata(target: Identity<any>, token: IToken) {
    if (getMetadata(deninjectLock, target)) {
        throw new TokenError(<string>target.name, token);
    }

    defineMetadata(deninjectToken, token, target);
}

export function defineSingletonMetadata(target: any, targetKey: string | symbol) {
    defineMetadata(deninjectSingleton, true, target, targetKey);
}

export function pushInjectMetadata(target: any, targetKey: string | symbol | undefined, 
    parameterIndex: number, token: IToken) {
    let injectMetadata = getInjectMetadata(target, targetKey);

    if (!injectMetadata) {
        injectMetadata = {};
        defineMetadata(deninjectInject, injectMetadata, target, targetKey);
    }

    injectMetadata[parameterIndex] = token;
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

export function pushClassMetadata(target: Identity<any>, isSingleton: boolean) {
    let scope: string | undefined = getMetadata(deninjectScope, target);

    if (scope) {
        nonModulesMetadata[scope] = [];
    }
    else {
        scope = root;
    }

    nonModulesMetadata[scope].push({
        isSingleton: isSingleton,
        token: getMetadata(deninjectToken, target),
        target: target,
        dependencies: getMetadata(designParamtypes, target) || [],
        inject: getInjectMetadata(target),
        create(args: any[]): any {
            let constructor: ObjectConstructor = target.prototype.constructor;
            return new constructor(...args);
        }
    }); 

    defineMetadata(deninjectLock, true, target);
}