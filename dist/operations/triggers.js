"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renameTrigger = exports.createTrigger = exports.dropTrigger = void 0;
const utils_1 = require("../utils");
const functions_1 = require("./functions");
function dropTrigger(mOptions) {
    const _drop = (tableName, triggerName, options = {}) => {
        const { ifExists, cascade } = options;
        const ifExistsStr = ifExists ? ' IF EXISTS' : '';
        const cascadeStr = cascade ? ' CASCADE' : '';
        const triggerNameStr = mOptions.literal(triggerName);
        const tableNameStr = mOptions.literal(tableName);
        return `DROP TRIGGER${ifExistsStr} ${triggerNameStr} ON ${tableNameStr}${cascadeStr};`;
    };
    return _drop;
}
exports.dropTrigger = dropTrigger;
function createTrigger(mOptions) {
    const _create = (tableName, triggerName, triggerOptions, definition) => {
        const { constraint, condition, operation, deferrable, deferred, functionParams = [] } = triggerOptions;
        let { when, level = 'STATEMENT', function: functionName } = triggerOptions;
        const operations = Array.isArray(operation) ? operation.join(' OR ') : operation;
        if (constraint) {
            when = 'AFTER';
        }
        if (!when) {
            throw new Error('"when" (BEFORE/AFTER/INSTEAD OF) have to be specified');
        }
        const isInsteadOf = /instead\s+of/i.test(when);
        if (isInsteadOf) {
            level = 'ROW';
        }
        if (definition) {
            functionName = functionName === undefined ? triggerName : functionName;
        }
        if (!functionName) {
            throw new Error("Can't determine function name");
        }
        if (isInsteadOf && condition) {
            throw new Error("INSTEAD OF trigger can't have condition specified");
        }
        if (!operations) {
            throw new Error('"operation" (INSERT/UPDATE[ OF ...]/DELETE/TRUNCATE) have to be specified');
        }
        const defferStr = constraint
            ? `${deferrable ? `DEFERRABLE INITIALLY ${deferred ? 'DEFERRED' : 'IMMEDIATE'}` : 'NOT DEFERRABLE'}\n  `
            : '';
        const conditionClause = condition ? `WHEN (${condition})\n  ` : '';
        const constraintStr = constraint ? ' CONSTRAINT' : '';
        const paramsStr = functionParams.map(utils_1.escapeValue).join(', ');
        const triggerNameStr = mOptions.literal(triggerName);
        const tableNameStr = mOptions.literal(tableName);
        const functionNameStr = mOptions.literal(functionName);
        const triggerSQL = `CREATE${constraintStr} TRIGGER ${triggerNameStr}
  ${when} ${operations} ON ${tableNameStr}
  ${defferStr}FOR EACH ${level}
  ${conditionClause}EXECUTE PROCEDURE ${functionNameStr}(${paramsStr});`;
        const fnSQL = definition
            ? `${(0, functions_1.createFunction)(mOptions)(functionName, [], Object.assign(Object.assign({}, triggerOptions), { returns: 'trigger' }), definition)}\n`
            : '';
        return `${fnSQL}${triggerSQL}`;
    };
    _create.reverse = (tableName, triggerName, triggerOptions, definition) => {
        const triggerSQL = dropTrigger(mOptions)(tableName, triggerName, triggerOptions);
        const fnSQL = definition
            ? `\n${(0, functions_1.dropFunction)(mOptions)(triggerOptions.function || triggerName, [], triggerOptions)}`
            : '';
        return `${triggerSQL}${fnSQL}`;
    };
    return _create;
}
exports.createTrigger = createTrigger;
function renameTrigger(mOptions) {
    const _rename = (tableName, oldTriggerName, newTriggerName) => {
        const oldTriggerNameStr = mOptions.literal(oldTriggerName);
        const tableNameStr = mOptions.literal(tableName);
        const newTriggerNameStr = mOptions.literal(newTriggerName);
        return `ALTER TRIGGER ${oldTriggerNameStr} ON ${tableNameStr} RENAME TO ${newTriggerNameStr};`;
    };
    _rename.reverse = (tableName, oldTriggerName, newTriggerName) => _rename(tableName, newTriggerName, oldTriggerName);
    return _rename;
}
exports.renameTrigger = renameTrigger;
