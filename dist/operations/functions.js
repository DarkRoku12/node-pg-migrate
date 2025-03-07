"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renameFunction = exports.createFunction = exports.dropFunction = void 0;
const utils_1 = require("../utils");
function dropFunction(mOptions) {
    const _drop = (functionName, functionParams = [], options = {}) => {
        const { ifExists, cascade } = options;
        const ifExistsStr = ifExists ? ' IF EXISTS' : '';
        const cascadeStr = cascade ? ' CASCADE' : '';
        const paramsStr = (0, utils_1.formatParams)(functionParams, mOptions);
        const functionNameStr = mOptions.literal(functionName);
        return `DROP FUNCTION${ifExistsStr} ${functionNameStr}${paramsStr}${cascadeStr};`;
    };
    return _drop;
}
exports.dropFunction = dropFunction;
function createFunction(mOptions) {
    const _create = (functionName, functionParams = [], functionOptions, definition) => {
        const { replace, returns = 'void', language, window, behavior = 'VOLATILE', onNull, parallel } = functionOptions;
        const options = [];
        if (behavior) {
            options.push(behavior);
        }
        if (language) {
            options.push(`LANGUAGE ${language}`);
        }
        else {
            throw new Error(`Language for function ${functionName} have to be specified`);
        }
        if (window) {
            options.push('WINDOW');
        }
        if (onNull) {
            options.push('RETURNS NULL ON NULL INPUT');
        }
        if (parallel) {
            options.push(`PARALLEL ${parallel}`);
        }
        const replaceStr = replace ? ' OR REPLACE' : '';
        const paramsStr = (0, utils_1.formatParams)(functionParams, mOptions);
        const functionNameStr = mOptions.literal(functionName);
        return `CREATE${replaceStr} FUNCTION ${functionNameStr}${paramsStr}
  RETURNS ${returns}
  AS ${(0, utils_1.escapeValue)(definition)}
  ${options.join('\n  ')};`;
    };
    _create.reverse = dropFunction(mOptions);
    return _create;
}
exports.createFunction = createFunction;
function renameFunction(mOptions) {
    const _rename = (oldFunctionName, functionParams = [], newFunctionName) => {
        const paramsStr = (0, utils_1.formatParams)(functionParams, mOptions);
        const oldFunctionNameStr = mOptions.literal(oldFunctionName);
        const newFunctionNameStr = mOptions.literal(newFunctionName);
        return `ALTER FUNCTION ${oldFunctionNameStr}${paramsStr} RENAME TO ${newFunctionNameStr};`;
    };
    _rename.reverse = (oldFunctionName, functionParams, newFunctionName) => _rename(newFunctionName, functionParams, oldFunctionName);
    return _rename;
}
exports.renameFunction = renameFunction;
