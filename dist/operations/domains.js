"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renameDomain = exports.alterDomain = exports.createDomain = exports.dropDomain = void 0;
const utils_1 = require("../utils");
function dropDomain(mOptions) {
    const _drop = (domainName, options = {}) => {
        const { ifExists, cascade } = options;
        const ifExistsStr = ifExists ? ' IF EXISTS' : '';
        const cascadeStr = cascade ? ' CASCADE' : '';
        const domainNameStr = mOptions.literal(domainName);
        return `DROP DOMAIN${ifExistsStr} ${domainNameStr}${cascadeStr};`;
    };
    return _drop;
}
exports.dropDomain = dropDomain;
function createDomain(mOptions) {
    const _create = (domainName, type, options = {}) => {
        const { default: defaultValue, collation, notNull, check, constraintName } = options;
        const constraints = [];
        if (collation) {
            constraints.push(`COLLATE ${collation}`);
        }
        if (defaultValue !== undefined) {
            constraints.push(`DEFAULT ${(0, utils_1.escapeValue)(defaultValue)}`);
        }
        if (notNull && check) {
            throw new Error('"notNull" and "check" can\'t be specified together');
        }
        else if (notNull || check) {
            if (constraintName) {
                constraints.push(`CONSTRAINT ${mOptions.literal(constraintName)}`);
            }
            if (notNull) {
                constraints.push('NOT NULL');
            }
            else if (check) {
                constraints.push(`CHECK (${check})`);
            }
        }
        const constraintsStr = constraints.length ? ` ${constraints.join(' ')}` : '';
        const typeStr = (0, utils_1.applyType)(type, mOptions.typeShorthands).type;
        const domainNameStr = mOptions.literal(domainName);
        return `CREATE DOMAIN ${domainNameStr} AS ${typeStr}${constraintsStr};`;
    };
    _create.reverse = (domainName, type, options) => dropDomain(mOptions)(domainName, options);
    return _create;
}
exports.createDomain = createDomain;
function alterDomain(mOptions) {
    const _alter = (domainName, options) => {
        const { default: defaultValue, notNull, allowNull, check, constraintName } = options;
        const actions = [];
        if (defaultValue === null) {
            actions.push('DROP DEFAULT');
        }
        else if (defaultValue !== undefined) {
            actions.push(`SET DEFAULT ${(0, utils_1.escapeValue)(defaultValue)}`);
        }
        if (notNull) {
            actions.push('SET NOT NULL');
        }
        else if (notNull === false || allowNull) {
            actions.push('DROP NOT NULL');
        }
        if (check) {
            actions.push(`${constraintName ? `CONSTRAINT ${mOptions.literal(constraintName)} ` : ''}CHECK (${check})`);
        }
        return `${actions.map((action) => `ALTER DOMAIN ${mOptions.literal(domainName)} ${action}`).join(';\n')};`;
    };
    return _alter;
}
exports.alterDomain = alterDomain;
function renameDomain(mOptions) {
    const _rename = (domainName, newDomainName) => {
        const domainNameStr = mOptions.literal(domainName);
        const newDomainNameStr = mOptions.literal(newDomainName);
        return `ALTER DOMAIN ${domainNameStr} RENAME TO ${newDomainNameStr};`;
    };
    _rename.reverse = (domainName, newDomainName) => _rename(newDomainName, domainName);
    return _rename;
}
exports.renameDomain = renameDomain;
