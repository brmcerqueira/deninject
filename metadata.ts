import { getMetadata, defineMetadata } from "./reflect.ts";

const designParamtypes = "design:paramtypes";
const designReturntype = "design:returntype";
const deninjectScope = "deninject:scope";
const deninjectSingleton = "deninject:singleton";
const deninjectProvider = "deninject:provider";

function hashCode(func: Function): string {
    let value = func.toString();
    let hash = 0; 
    let length = value.length; 
    let i = 0;

    if (length > 0){   
        while (i < length) {  
            hash = (hash << 5) - hash + value.charCodeAt(i++) | 0;
        }
    }

    return hash.toString();
};

export function getParamtypesMetadata(target: any, targetKey: string | symbol): string[] | undefined {
    let paramtypes: Function[] | undefined = getMetadata(designParamtypes, target, targetKey);
    return paramtypes ? paramtypes.map(hashCode) : undefined;
}

export function getReturntypeMetadata(target: any, targetKey: string | symbol): string | undefined {
    let returntype: Function | undefined = getMetadata(designReturntype, target, targetKey);
    return returntype ? hashCode(returntype) : undefined;
}

export function getScopeMetadata(target: any, targetKey: string | symbol): string | undefined {
    return getMetadata(deninjectScope, target, targetKey);
}

export function getSingletonMetadata(target: any, targetKey: string | symbol): boolean {
    return getMetadata(deninjectSingleton, target, targetKey) || false;
}

export function getProviderMetadata(target: any): (string | symbol)[] {
    return getMetadata(deninjectProvider, target) || [];
}

export function defineScopeMetadata(target: any, targetKey: string | symbol, value: string) {
    defineMetadata(deninjectScope, value, target, targetKey);
}

export function defineSingletonMetadata(target: any, targetKey: string | symbol) {
    defineMetadata(deninjectSingleton, true, target, targetKey);
}

export function pushProviderMetadata(target: any, targetKey: string | symbol) {
    let providers: (string | symbol)[] | undefined = getMetadata(deninjectProvider, target);
    if (!providers) {
        providers = [];
        defineMetadata(deninjectProvider, providers, target);
    }
    providers.push(targetKey);
}