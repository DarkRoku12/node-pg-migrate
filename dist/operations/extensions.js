"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createExtension = exports.dropExtension = void 0;
function dropExtension(mOptions) {
    const _drop = (_extensions, options = {}) => {
        const { ifExists, cascade } = options;
        const extensions = Array.isArray(_extensions) ? _extensions : [_extensions];
        const ifExistsStr = ifExists ? ' IF EXISTS' : '';
        const cascadeStr = cascade ? ' CASCADE' : '';
        return extensions.map((extension) => {
            const extensionStr = mOptions.literal(extension);
            return `DROP EXTENSION${ifExistsStr} ${extensionStr}${cascadeStr};`;
        });
    };
    return _drop;
}
exports.dropExtension = dropExtension;
function createExtension(mOptions) {
    const _create = (_extensions, options = {}) => {
        const { ifNotExists, schema } = options;
        const extensions = Array.isArray(_extensions) ? _extensions : [_extensions];
        const ifNotExistsStr = ifNotExists ? ' IF NOT EXISTS' : '';
        const schemaStr = schema ? ` SCHEMA ${mOptions.literal(schema)}` : '';
        return extensions.map((extension) => {
            const extensionStr = mOptions.literal(extension);
            return `CREATE EXTENSION${ifNotExistsStr} ${extensionStr}${schemaStr};`;
        });
    };
    _create.reverse = dropExtension(mOptions);
    return _create;
}
exports.createExtension = createExtension;
