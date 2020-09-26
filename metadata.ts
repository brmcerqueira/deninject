import { getMetadata, defineMetadata } from "./reflect.ts";

const deninjectScope = "deninject:scope"

export function getScopeMetadata(target: any, targetKey: string | symbol): string | undefined {
    return getMetadata(deninjectScope, target, targetKey);
}

export function defineScopeMetadata(target: any, targetKey: string | symbol, value: string) {
    defineMetadata(deninjectScope, value, target, targetKey);
}