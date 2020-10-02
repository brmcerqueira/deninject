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

    public valueOf(): string {
        return this.id;
    }

    public toString(): string {
        return this.id;
    }

    public apply(): DeninjectDecorator {
        return (target: any, propertyKey?: string | symbol) => {
            this.defineApply(target, propertyKey);      
        };
    }

    public abstract defineApply(target: any, propertyKey?: string | symbol): void;
}