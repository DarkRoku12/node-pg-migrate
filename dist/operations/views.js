"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renameView = exports.alterViewColumn = exports.alterView = exports.createView = exports.dropView = void 0;
const utils_1 = require("../utils");
const viewOptionStr = (options) => (key) => {
    const value = options[key] === true ? '' : ` = ${options[key]}`;
    return `${key}${value}`;
};
function dropView(mOptions) {
    const _drop = (viewName, options = {}) => {
        const { ifExists, cascade } = options;
        const ifExistsStr = ifExists ? ' IF EXISTS' : '';
        const cascadeStr = cascade ? ' CASCADE' : '';
        const viewNameStr = mOptions.literal(viewName);
        return `DROP VIEW${ifExistsStr} ${viewNameStr}${cascadeStr};`;
    };
    return _drop;
}
exports.dropView = dropView;
function createView(mOptions) {
    const _create = (viewName, viewOptions, definition) => {
        const { temporary, replace, recursive, columns = [], options = {}, checkOption } = viewOptions;
        const columnNames = (Array.isArray(columns) ? columns : [columns]).map(mOptions.literal).join(', ');
        const withOptions = Object.keys(options).map(viewOptionStr(options)).join(', ');
        const replaceStr = replace ? ' OR REPLACE' : '';
        const temporaryStr = temporary ? ' TEMPORARY' : '';
        const recursiveStr = recursive ? ' RECURSIVE' : '';
        const columnStr = columnNames ? `(${columnNames})` : '';
        const withOptionsStr = withOptions ? ` WITH (${withOptions})` : '';
        const checkOptionStr = checkOption ? ` WITH ${checkOption} CHECK OPTION` : '';
        const viewNameStr = mOptions.literal(viewName);
        return `CREATE${replaceStr}${temporaryStr}${recursiveStr} VIEW ${viewNameStr}${columnStr}${withOptionsStr} AS ${definition}${checkOptionStr};`;
    };
    _create.reverse = dropView(mOptions);
    return _create;
}
exports.createView = createView;
function alterView(mOptions) {
    const _alter = (viewName, viewOptions) => {
        const { checkOption, options = {} } = viewOptions;
        if (checkOption !== undefined) {
            if (options.check_option === undefined) {
                options.check_option = checkOption;
            }
            else {
                throw new Error('"options.check_option" and "checkOption" can\'t be specified together');
            }
        }
        const clauses = [];
        const withOptions = Object.keys(options)
            .filter((key) => options[key] !== null)
            .map(viewOptionStr(options))
            .join(', ');
        if (withOptions) {
            clauses.push(`SET (${withOptions})`);
        }
        const resetOptions = Object.keys(options)
            .filter((key) => options[key] === null)
            .join(', ');
        if (resetOptions) {
            clauses.push(`RESET (${resetOptions})`);
        }
        return clauses.map((clause) => `ALTER VIEW ${mOptions.literal(viewName)} ${clause};`).join('\n');
    };
    return _alter;
}
exports.alterView = alterView;
function alterViewColumn(mOptions) {
    const _alter = (viewName, columnName, options) => {
        const { default: defaultValue } = options;
        const actions = [];
        if (defaultValue === null) {
            actions.push('DROP DEFAULT');
        }
        else if (defaultValue !== undefined) {
            actions.push(`SET DEFAULT ${(0, utils_1.escapeValue)(defaultValue)}`);
        }
        const viewNameStr = mOptions.literal(viewName);
        const columnNameStr = mOptions.literal(columnName);
        return actions.map((action) => `ALTER VIEW ${viewNameStr} ALTER COLUMN ${columnNameStr} ${action};`).join('\n');
    };
    return _alter;
}
exports.alterViewColumn = alterViewColumn;
function renameView(mOptions) {
    const _rename = (viewName, newViewName) => {
        const viewNameStr = mOptions.literal(viewName);
        const newViewNameStr = mOptions.literal(newViewName);
        return `ALTER VIEW ${viewNameStr} RENAME TO ${newViewNameStr};`;
    };
    _rename.reverse = (viewName, newViewName) => _rename(newViewName, viewName);
    return _rename;
}
exports.renameView = renameView;
