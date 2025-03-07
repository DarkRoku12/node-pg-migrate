"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renamePolicy = exports.alterPolicy = exports.createPolicy = exports.dropPolicy = void 0;
const makeClauses = ({ role, using, check }) => {
    const roles = (Array.isArray(role) ? role : [role]).join(', ');
    const clauses = [];
    if (roles) {
        clauses.push(`TO ${roles}`);
    }
    if (using) {
        clauses.push(`USING (${using})`);
    }
    if (check) {
        clauses.push(`WITH CHECK (${check})`);
    }
    return clauses;
};
function dropPolicy(mOptions) {
    const _drop = (tableName, policyName, options = {}) => {
        const { ifExists } = options;
        const ifExistsStr = ifExists ? ' IF EXISTS' : '';
        const policyNameStr = mOptions.literal(policyName);
        const tableNameStr = mOptions.literal(tableName);
        return `DROP POLICY${ifExistsStr} ${policyNameStr} ON ${tableNameStr};`;
    };
    return _drop;
}
exports.dropPolicy = dropPolicy;
function createPolicy(mOptions) {
    const _create = (tableName, policyName, options = {}) => {
        const createOptions = Object.assign(Object.assign({}, options), { role: options.role || 'PUBLIC' });
        const clauses = [`FOR ${options.command || 'ALL'}`, ...makeClauses(createOptions)];
        const clausesStr = clauses.join(' ');
        const policyNameStr = mOptions.literal(policyName);
        const tableNameStr = mOptions.literal(tableName);
        return `CREATE POLICY ${policyNameStr} ON ${tableNameStr} ${clausesStr};`;
    };
    _create.reverse = dropPolicy(mOptions);
    return _create;
}
exports.createPolicy = createPolicy;
function alterPolicy(mOptions) {
    const _alter = (tableName, policyName, options = {}) => {
        const clausesStr = makeClauses(options).join(' ');
        const policyNameStr = mOptions.literal(policyName);
        const tableNameStr = mOptions.literal(tableName);
        return `ALTER POLICY ${policyNameStr} ON ${tableNameStr} ${clausesStr};`;
    };
    return _alter;
}
exports.alterPolicy = alterPolicy;
function renamePolicy(mOptions) {
    const _rename = (tableName, policyName, newPolicyName) => {
        const policyNameStr = mOptions.literal(policyName);
        const newPolicyNameStr = mOptions.literal(newPolicyName);
        const tableNameStr = mOptions.literal(tableName);
        return `ALTER POLICY ${policyNameStr} ON ${tableNameStr} RENAME TO ${newPolicyNameStr};`;
    };
    _rename.reverse = (tableName, policyName, newPolicyName) => _rename(tableName, newPolicyName, policyName);
    return _rename;
}
exports.renamePolicy = renamePolicy;
