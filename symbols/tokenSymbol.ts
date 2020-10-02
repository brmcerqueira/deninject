import { defineInject, defineToken } from "../decorators.ts";
import type { IToken } from "../reflections/metadata.ts";
import { AbstractSymbol } from "./abstractSymbol.ts";

export class TokenSymbol extends AbstractSymbol implements IToken {
    constructor(private _ignoreType: boolean = false) {
        super();
    }

    public get ignoreType(): boolean {
        return this._ignoreType;
    }

    public defineApply(target: any, propertyKey?: string | symbol): void {
        defineToken(target, this.id, propertyKey, this._ignoreType); 
    }

    public defineInject(target: any, propertyKey: string | symbol, parameterIndex: number): void {
        defineInject(target, propertyKey, parameterIndex, this.id, this._ignoreType);
    }

    public inject(): ParameterDecorator {
        return (target: any, propertyKey: string | symbol, parameterIndex: number) => {
            this.defineInject(target, propertyKey, parameterIndex);
        };
    }
}