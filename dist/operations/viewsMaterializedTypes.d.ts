import { Name, DropOptions, IfNotExistsOption, Nullable } from './generalTypes';
export declare type StorageParameters = {
    [key: string]: boolean | number;
};
export interface CreateMaterializedViewOptions extends IfNotExistsOption {
    columns?: string | string[];
    tablespace?: string;
    storageParameters?: StorageParameters;
    data?: boolean;
}
export interface AlterMaterializedViewOptions {
    cluster?: null | false | string;
    extension?: string;
    storageParameters?: Nullable<StorageParameters>;
}
export interface RefreshMaterializedViewOptions {
    concurrently?: boolean;
    data?: boolean;
}
declare type CreateMaterializedViewFn = (viewName: Name, options: CreateMaterializedViewOptions & DropOptions, definition: string) => string | string[];
export declare type CreateMaterializedView = CreateMaterializedViewFn & {
    reverse: CreateMaterializedViewFn;
};
export declare type DropMaterializedView = (viewName: Name, options?: DropOptions) => string | string[];
export declare type AlterMaterializedView = (viewName: Name, options: AlterMaterializedViewOptions) => string | string[];
declare type RenameMaterializedViewFn = (viewName: Name, newViewName: Name) => string | string[];
export declare type RenameMaterializedView = RenameMaterializedViewFn & {
    reverse: RenameMaterializedViewFn;
};
declare type RenameMaterializedViewColumnFn = (viewName: Name, columnName: string, newColumnName: string) => string | string[];
export declare type RenameMaterializedViewColumn = RenameMaterializedViewColumnFn & {
    reverse: RenameMaterializedViewColumnFn;
};
declare type RefreshMaterializedViewFn = (viewName: Name, options?: RefreshMaterializedViewOptions) => string | string[];
export declare type RefreshMaterializedView = RefreshMaterializedViewFn & {
    reverse: RefreshMaterializedViewFn;
};
export {};
