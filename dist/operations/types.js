"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renameTypeValue = exports.renameTypeAttribute = exports.renameType = exports.addTypeValue = exports.setTypeAttribute = exports.addTypeAttribute = exports.dropTypeAttribute = exports.createType = exports.dropType = void 0;
const utils_1 = require("../utils");
function dropType(mOptions) {
    const _drop = (typeName, options = {}) => {
        const { ifExists, cascade } = options;
        const ifExistsStr = ifExists ? ' IF EXISTS' : '';
        const cascadeStr = cascade ? ' CASCADE' : '';
        const typeNameStr = mOptions.literal(typeName);
        return `DROP TYPE${ifExistsStr} ${typeNameStr}${cascadeStr};`;
    };
    return _drop;
}
exports.dropType = dropType;
function createType(mOptions) {
    const _create = (typeName, options) => {
        if (Array.isArray(options)) {
            const optionsStr = options.map(utils_1.escapeValue).join(', ');
            const typeNameStr = mOptions.literal(typeName);
            return `CREATE TYPE ${typeNameStr} AS ENUM (${optionsStr});`;
        }
        const attributes = Object.entries(options)
            .map(([attributeName, attribute]) => {
            const typeStr = (0, utils_1.applyType)(attribute, mOptions.typeShorthands).type;
            return `${mOptions.literal(attributeName)} ${typeStr}`;
        })
            .join(',\n');
        return `CREATE TYPE ${mOptions.literal(typeName)} AS (\n${attributes}\n);`;
    };
    _create.reverse = dropType(mOptions);
    return _create;
}
exports.createType = createType;
function dropTypeAttribute(mOptions) {
    const _drop = (typeName, attributeName, { ifExists } = {}) => {
        const ifExistsStr = ifExists ? ' IF EXISTS' : '';
        const typeNameStr = mOptions.literal(typeName);
        const attributeNameStr = mOptions.literal(attributeName);
        return `ALTER TYPE ${typeNameStr} DROP ATTRIBUTE ${attributeNameStr}${ifExistsStr};`;
    };
    return _drop;
}
exports.dropTypeAttribute = dropTypeAttribute;
function addTypeAttribute(mOptions) {
    const _alterAttributeAdd = (typeName, attributeName, attributeType) => {
        const typeStr = (0, utils_1.applyType)(attributeType, mOptions.typeShorthands).type;
        const typeNameStr = mOptions.literal(typeName);
        const attributeNameStr = mOptions.literal(attributeName);
        return `ALTER TYPE ${typeNameStr} ADD ATTRIBUTE ${attributeNameStr} ${typeStr};`;
    };
    _alterAttributeAdd.reverse = dropTypeAttribute(mOptions);
    return _alterAttributeAdd;
}
exports.addTypeAttribute = addTypeAttribute;
function setTypeAttribute(mOptions) {
    return (typeName, attributeName, attributeType) => {
        const typeStr = (0, utils_1.applyType)(attributeType, mOptions.typeShorthands).type;
        const typeNameStr = mOptions.literal(typeName);
        const attributeNameStr = mOptions.literal(attributeName);
        return `ALTER TYPE ${typeNameStr} ALTER ATTRIBUTE ${attributeNameStr} SET DATA TYPE ${typeStr};`;
    };
}
exports.setTypeAttribute = setTypeAttribute;
function addTypeValue(mOptions) {
    const _add = (typeName, value, options = {}) => {
        const { ifNotExists, before, after } = options;
        if (before && after) {
            throw new Error('"before" and "after" can\'t be specified together');
        }
        const beforeStr = before ? ` BEFORE ${(0, utils_1.escapeValue)(before)}` : '';
        const afterStr = after ? ` AFTER ${(0, utils_1.escapeValue)(after)}` : '';
        const ifNotExistsStr = ifNotExists ? ' IF NOT EXISTS' : '';
        const valueStr = (0, utils_1.escapeValue)(value);
        const typeNameStr = mOptions.literal(typeName);
        return `ALTER TYPE ${typeNameStr} ADD VALUE${ifNotExistsStr} ${valueStr}${beforeStr}${afterStr};`;
    };
    return _add;
}
exports.addTypeValue = addTypeValue;
function renameType(mOptions) {
    const _rename = (typeName, newTypeName) => {
        const typeNameStr = mOptions.literal(typeName);
        const newTypeNameStr = mOptions.literal(newTypeName);
        return `ALTER TYPE ${typeNameStr} RENAME TO ${newTypeNameStr};`;
    };
    _rename.reverse = (typeName, newTypeName) => _rename(newTypeName, typeName);
    return _rename;
}
exports.renameType = renameType;
function renameTypeAttribute(mOptions) {
    const _rename = (typeName, attributeName, newAttributeName) => {
        const typeNameStr = mOptions.literal(typeName);
        const attributeNameStr = mOptions.literal(attributeName);
        const newAttributeNameStr = mOptions.literal(newAttributeName);
        return `ALTER TYPE ${typeNameStr} RENAME ATTRIBUTE ${attributeNameStr} TO ${newAttributeNameStr};`;
    };
    _rename.reverse = (typeName, attributeName, newAttributeName) => _rename(typeName, newAttributeName, attributeName);
    return _rename;
}
exports.renameTypeAttribute = renameTypeAttribute;
function renameTypeValue(mOptions) {
    const _rename = (typeName, value, newValue) => {
        const valueStr = (0, utils_1.escapeValue)(value);
        const newValueStr = (0, utils_1.escapeValue)(newValue);
        const typeNameStr = mOptions.literal(typeName);
        return `ALTER TYPE ${typeNameStr} RENAME VALUE ${valueStr} TO ${newValueStr};`;
    };
    _rename.reverse = (typeName, value, newValue) => _rename(typeName, newValue, value);
    return _rename;
}
exports.renameTypeValue = renameTypeValue;
