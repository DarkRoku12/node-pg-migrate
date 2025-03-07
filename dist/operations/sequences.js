"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renameSequence = exports.alterSequence = exports.createSequence = exports.dropSequence = exports.parseSequenceOptions = void 0;
const utils_1 = require("../utils");
const parseSequenceOptions = (typeShorthands, options) => {
    const { type, increment, minvalue, maxvalue, start, cache, cycle, owner } = options;
    const clauses = [];
    if (type) {
        clauses.push(`AS ${(0, utils_1.applyType)(type, typeShorthands).type}`);
    }
    if (increment) {
        clauses.push(`INCREMENT BY ${increment}`);
    }
    if (minvalue) {
        clauses.push(`MINVALUE ${minvalue}`);
    }
    else if (minvalue === null || minvalue === false) {
        clauses.push('NO MINVALUE');
    }
    if (maxvalue) {
        clauses.push(`MAXVALUE ${maxvalue}`);
    }
    else if (maxvalue === null || maxvalue === false) {
        clauses.push('NO MAXVALUE');
    }
    if (start) {
        clauses.push(`START WITH ${start}`);
    }
    if (cache) {
        clauses.push(`CACHE ${cache}`);
    }
    if (cycle) {
        clauses.push('CYCLE');
    }
    else if (cycle === false) {
        clauses.push('NO CYCLE');
    }
    if (owner) {
        clauses.push(`OWNED BY ${owner}`);
    }
    else if (owner === null || owner === false) {
        clauses.push('OWNED BY NONE');
    }
    return clauses;
};
exports.parseSequenceOptions = parseSequenceOptions;
function dropSequence(mOptions) {
    const _drop = (sequenceName, options = {}) => {
        const { ifExists, cascade } = options;
        const ifExistsStr = ifExists ? ' IF EXISTS' : '';
        const cascadeStr = cascade ? ' CASCADE' : '';
        const sequenceNameStr = mOptions.literal(sequenceName);
        return `DROP SEQUENCE${ifExistsStr} ${sequenceNameStr}${cascadeStr};`;
    };
    return _drop;
}
exports.dropSequence = dropSequence;
function createSequence(mOptions) {
    const _create = (sequenceName, options = {}) => {
        const { temporary, ifNotExists } = options;
        const temporaryStr = temporary ? ' TEMPORARY' : '';
        const ifNotExistsStr = ifNotExists ? ' IF NOT EXISTS' : '';
        const sequenceNameStr = mOptions.literal(sequenceName);
        const clausesStr = (0, exports.parseSequenceOptions)(mOptions.typeShorthands, options).join('\n  ');
        return `CREATE${temporaryStr} SEQUENCE${ifNotExistsStr} ${sequenceNameStr}
  ${clausesStr};`;
    };
    _create.reverse = dropSequence(mOptions);
    return _create;
}
exports.createSequence = createSequence;
function alterSequence(mOptions) {
    return (sequenceName, options) => {
        const { restart } = options;
        const clauses = (0, exports.parseSequenceOptions)(mOptions.typeShorthands, options);
        if (restart) {
            if (restart === true) {
                clauses.push('RESTART');
            }
            else {
                clauses.push(`RESTART WITH ${restart}`);
            }
        }
        return `ALTER SEQUENCE ${mOptions.literal(sequenceName)}
  ${clauses.join('\n  ')};`;
    };
}
exports.alterSequence = alterSequence;
function renameSequence(mOptions) {
    const _rename = (sequenceName, newSequenceName) => {
        const sequenceNameStr = mOptions.literal(sequenceName);
        const newSequenceNameStr = mOptions.literal(newSequenceName);
        return `ALTER SEQUENCE ${sequenceNameStr} RENAME TO ${newSequenceNameStr};`;
    };
    _rename.reverse = (sequenceName, newSequenceName) => _rename(newSequenceName, sequenceName);
    return _rename;
}
exports.renameSequence = renameSequence;
