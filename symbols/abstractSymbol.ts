import type { DeninjectDecorator } from "../decorators.ts";
import { generateHashCode } from "../generateHashCode.ts";

export abstract class AbstractSymbol {
    private _id: string;

    constructor() {
        this._id = generateHashCode();
    }

    public get id(): string {
        return this._id;
    }

    public apply(): DeninjectDecorator {
        return (target: any, propertyKey?: string | symbol) => {
            this.applyDecorator(target, propertyKey);      
        };
    }

    protected abstract applyDecorator(target: any, propertyKey?: string | symbol): void;
}