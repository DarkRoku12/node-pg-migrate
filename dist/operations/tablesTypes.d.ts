import { Name, Value, IfNotExistsOption, DropOptions } from './generalTypes';
import { SequenceOptions } from './sequencesTypes';
export declare type Action = 'NO ACTION' | 'RESTRICT' | 'CASCADE' | 'SET NULL' | 'SET DEFAULT';
export interface ReferencesOptions {
    referencesConstraintName?: string;
    referencesConstraintComment?: string;
    references: Name;
    onDelete?: Action;
    onUpdate?: Action;
    match?: 'FULL' | 'SIMPLE';
}
declare type SequenceGeneratedOptions = {
    precedence: 'ALWAYS' | 'BY DEFAULT';
} & SequenceOptions;
export interface ColumnDefinition extends Partial<ReferencesOptions> {
    type: string;
    collation?: string;
    unique?: boolean;
    primaryKey?: boolean;
    notNull?: boolean;
    default?: Value;
    check?: string;
    deferrable?: boolean;
    deferred?: boolean;
    comment?: string | null;
    /**
     * @deprecated use sequenceGenerated
     */
    generated?: SequenceGeneratedOptions;
    sequenceGenerated?: SequenceGeneratedOptions;
    expressionGenerated?: string;
}
export interface ColumnDefinitions {
    [name: string]: ColumnDefinition | string;
}
export declare type Like = 'COMMENTS' | 'CONSTRAINTS' | 'DEFAULTS' | 'IDENTITY' | 'INDEXES' | 'STATISTICS' | 'STORAGE' | 'ALL';
export interface LikeOptions {
    including?: Like | Like[];
    excluding?: Like | Like[];
}
export interface ForeignKeyOptions extends ReferencesOptions {
    columns: Name | Name[];
}
export interface ConstraintOptions {
    check?: string | string[];
    unique?: Name | Array<Name | Name[]>;
    primaryKey?: Name | Name[];
    foreignKeys?: ForeignKeyOptions | ForeignKeyOptions[];
    exclude?: string;
    deferrable?: boolean;
    deferred?: boolean;
    comment?: string;
}
export interface TableOptions extends IfNotExistsOption {
    temporary?: boolean;
    inherits?: Name;
    like?: Name | {
        table: Name;
        options?: LikeOptions;
    };
    constraints?: ConstraintOptions;
    comment?: string | null;
}
export interface AlterTableOptions {
    levelSecurity: 'DISABLE' | 'ENABLE' | 'FORCE' | 'NO FORCE';
}
export interface AlterColumnOptions {
    type?: string;
    default?: Value;
    notNull?: boolean;
    allowNull?: boolean;
    collation?: string;
    using?: string;
    comment?: string | null;
    /**
     * @deprecated use sequenceGenerated
     */
    generated?: null | false | SequenceGeneratedOptions;
    sequenceGenerated?: null | false | SequenceGeneratedOptions;
}
declare type CreateTableFn = (tableName: Name, columns: ColumnDefinitions, options?: TableOptions & DropOptions) => string | string[];
export declare type CreateTable = CreateTableFn & {
    reverse: CreateTableFn;
};
export declare type DropTable = (tableName: Name, dropOptions?: DropOptions) => string | string[];
declare type RenameTableFn = (tableName: Name, newtableName: Name) => string | string[];
export declare type RenameTable = RenameTableFn & {
    reverse: RenameTableFn;
};
export declare type AlterTable = (tableName: Name, alterOptions: AlterTableOptions) => string | string[];
declare type AddColumnsFn = (tableName: Name, newColumns: ColumnDefinitions, addOptions?: IfNotExistsOption & DropOptions) => string | string[];
export declare type AddColumns = AddColumnsFn & {
    reverse: AddColumnsFn;
};
export declare type DropColumns = (tableName: Name, columns: string | string[] | {
    [name: string]: unknown;
}, dropOptions?: DropOptions) => string | string[];
declare type RenameColumnFn = (tableName: Name, oldColumnName: string, newColumnName: string) => string | string[];
export declare type RenameColumn = RenameColumnFn & {
    reverse: RenameColumnFn;
};
export declare type AlterColumn = (tableName: Name, columnName: string, options: AlterColumnOptions) => string | string[];
declare type CreateConstraintFn = (tableName: Name, constraintName: string | null, expression: (string | ConstraintOptions) & DropOptions) => string | string[];
export declare type CreateConstraint = CreateConstraintFn & {
    reverse: CreateConstraintFn;
};
export declare type DropConstraint = (tableName: Name, constraintName: string, options?: DropOptions) => string | string[];
declare type RenameConstraintFn = (tableName: Name, oldConstraintName: string, newConstraintName: string) => string | string[];
export declare type RenameConstraint = RenameConstraintFn & {
    reverse: RenameConstraintFn;
};
export {};
