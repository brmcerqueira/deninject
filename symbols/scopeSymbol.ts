import { defineScope } from "../decorators.ts";
import { AbstractSymbol } from "./abstractSymbol.ts";

export class ScopeSymbol extends AbstractSymbol {
    constructor() {
        super();
    }

    protected applyDecorator(target: any, propertyKey?: string | symbol): void {
        defineScope(target, this.id, propertyKey); 
    }
}