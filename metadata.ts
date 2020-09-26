import { getMetadata, defineMetadata } from "./reflect.ts";

const deninjectScope = "deninject:scope"
const deninjectTransient = "deninject:transient"

export function getScopeMetadata(target: any, targetKey: string | symbol): string | undefined {
    return getMetadata(deninjectScope, target, targetKey);
}

export function defineScopeMetadata(target: any, targetKey: string | symbol, value: string) {
    defineMetadata(deninjectScope, value, target, targetKey);
}

export function getTransientMetadata(target: any, targetKey: string | symbol): boolean | undefined {
    return getMetadata(deninjectTransient, target, targetKey);
}

export function defineTransientMetadata(target: any, targetKey: string | symbol, value: boolean) {
    defineMetadata(deninjectTransient, value, target, targetKey);
}