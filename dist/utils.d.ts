import { ColumnDefinitions, ColumnDefinition } from './operations/tablesTypes';
import { Name, Type, Value } from './operations/generalTypes';
import { MigrationOptions, Literal, RunnerOption } from './types';
import { FunctionParam, FunctionParamType } from './operations/functionsTypes';
import { PgLiteral } from '.';
export declare const createSchemalize: (shouldDecamelize: boolean, shouldQuote: boolean) => (v: Name) => string;
export declare class StringIdGenerator {
    private readonly chars;
    private ids;
    constructor(chars?: string);
    next(): string;
    private increment;
}
export declare const escapeValue: (val: Value) => string | number;
export declare const createTransformer: (literal: Literal) => (s: string, d?: {
    [key: string]: string | number | boolean | PgLiteral | import("./operations/generalTypes").PublicPart<PgLiteral> | Value[] | {
        schema?: string | undefined;
        name: string;
    } | null;
} | undefined) => string;
export declare const getSchemas: (schema?: string | string[] | undefined) => string[];
export declare const getMigrationTableSchema: (options: RunnerOption) => string;
export declare const applyTypeAdapters: (type: string) => string;
export declare const applyType: (type: Type, extendingTypeShorthands?: ColumnDefinitions) => ColumnDefinition & FunctionParamType;
export declare const formatParams: (params: FunctionParam[], mOptions: MigrationOptions) => string;
export declare const makeComment: (object: string, name: string, text?: string | null | undefined) => string;
export declare const formatLines: (lines: string[], replace?: string, separator?: string) => string;
export declare function intersection<T>(list1: T[], list2: T[]): T[];
