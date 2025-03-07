"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renameSchema = exports.createSchema = exports.dropSchema = void 0;
function dropSchema(mOptions) {
    const _drop = (schemaName, options = {}) => {
        const { ifExists, cascade } = options;
        const ifExistsStr = ifExists ? ' IF EXISTS' : '';
        const cascadeStr = cascade ? ' CASCADE' : '';
        const schemaNameStr = mOptions.literal(schemaName);
        return `DROP SCHEMA${ifExistsStr} ${schemaNameStr}${cascadeStr};`;
    };
    return _drop;
}
exports.dropSchema = dropSchema;
function createSchema(mOptions) {
    const _create = (schemaName, options = {}) => {
        const { ifNotExists, authorization } = options;
        const ifNotExistsStr = ifNotExists ? ' IF NOT EXISTS' : '';
        const schemaNameStr = mOptions.literal(schemaName);
        const authorizationStr = authorization ? ` AUTHORIZATION ${authorization}` : '';
        return `CREATE SCHEMA${ifNotExistsStr} ${schemaNameStr}${authorizationStr};`;
    };
    _create.reverse = dropSchema(mOptions);
    return _create;
}
exports.createSchema = createSchema;
function renameSchema(mOptions) {
    const _rename = (schemaName, newSchemaName) => {
        const schemaNameStr = mOptions.literal(schemaName);
        const newSchemaNameStr = mOptions.literal(newSchemaName);
        return `ALTER SCHEMA ${schemaNameStr} RENAME TO ${newSchemaNameStr};`;
    };
    _rename.reverse = (schemaName, newSchemaName) => _rename(newSchemaName, schemaName);
    return _rename;
}
exports.renameSchema = renameSchema;
