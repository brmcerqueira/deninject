import { generateHashCode } from "../generateHashCode.ts";

import { defineInject, defineToken } from "../decorators.ts";
import { AbstractSymbol } from "./abstractSymbol.ts";

export class TokenSymbol extends AbstractSymbol {
    constructor(private _ignoreType: boolean = false) {
        super();
    }

    public get ignoreType(): boolean {
        return this._ignoreType;
    }

    protected applyDecorator(target: any, propertyKey?: string | symbol): void {
        defineToken(target, this.id, propertyKey, this._ignoreType); 
    }

    public inject(): ParameterDecorator {
        return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
            defineInject(target, propertyKey, parameterIndex, this.id, this._ignoreType);
        };
    }
}