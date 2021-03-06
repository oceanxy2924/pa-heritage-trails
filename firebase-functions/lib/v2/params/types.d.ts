/** @hidden */
declare type ParamValueType = 'string' | 'list' | 'boolean' | 'int' | 'float' | 'json';
export interface ParamSpec<T = unknown> {
    name: string;
    default?: T;
    label?: string;
    description?: string;
    valueType?: ParamValueType;
}
export declare type ParamOptions<T = unknown> = Omit<ParamSpec<T>, 'name' | 'valueType'>;
export declare class Param<T = unknown> {
    readonly name: string;
    readonly options: ParamOptions<T>;
    static valueType: ParamValueType;
    constructor(name: string, options?: ParamOptions<T>);
    get rawValue(): string | undefined;
    get value(): any;
    toString(): string;
    toJSON(): string;
    toSpec(): ParamSpec<string>;
}
export declare class StringParam extends Param<string> {
}
export declare class IntParam extends Param<number> {
    static valueType: ParamValueType;
    get value(): number;
}
export declare class FloatParam extends Param<number> {
    static valueType: ParamValueType;
    get value(): number;
}
export declare class BooleanParam extends Param {
    static valueType: ParamValueType;
    get value(): boolean;
}
export declare class ListParam extends Param<string[]> {
    static valueType: ParamValueType;
    get value(): string[];
    toSpec(): ParamSpec<string>;
}
export declare class JSONParam<T = any> extends Param<T> {
    static valueType: ParamValueType;
    get value(): T;
}
export {};
