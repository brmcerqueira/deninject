import { pushInjectMetadata } from "../reflections/metadata.ts";

export function Inject(name: string): ParameterDecorator {
    return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
        pushInjectMetadata(target, propertyKey, parameterIndex, name);
    };
}