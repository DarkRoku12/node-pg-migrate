"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addConstraint = exports.dropConstraint = exports.renameConstraint = exports.renameColumn = exports.renameTable = exports.alterColumn = exports.addColumns = exports.dropColumns = exports.alterTable = exports.createTable = exports.dropTable = void 0;
const utils_1 = require("../utils");
const sequences_1 = require("./sequences");
const parseReferences = (options, literal) => {
    const { references, match, onDelete, onUpdate } = options;
    const clauses = [];
    clauses.push(typeof references === 'string' && (references.startsWith('"') || references.endsWith(')'))
        ? `REFERENCES ${references}`
        : `REFERENCES ${literal(references)}`);
    if (match) {
        clauses.push(`MATCH ${match}`);
    }
    if (onDelete) {
        clauses.push(`ON DELETE ${onDelete}`);
    }
    if (onUpdate) {
        clauses.push(`ON UPDATE ${onUpdate}`);
    }
    return clauses.join(' ');
};
const parseDeferrable = (options) => `DEFERRABLE INITIALLY ${options.deferred ? 'DEFERRED' : 'IMMEDIATE'}`;
const parseColumns = (tableName, columns, mOptions) => {
    const extendingTypeShorthands = mOptions.typeShorthands;
    let columnsWithOptions = Object.keys(columns).reduce((previous, column) => (Object.assign(Object.assign({}, previous), { [column]: (0, utils_1.applyType)(columns[column], extendingTypeShorthands) })), {});
    const primaryColumns = Object.entries(columnsWithOptions)
        .filter(([, { primaryKey }]) => Boolean(primaryKey))
        .map(([columnName]) => columnName);
    const multiplePrimaryColumns = primaryColumns.length > 1;
    if (multiplePrimaryColumns) {
        columnsWithOptions = Object.entries(columnsWithOptions).reduce((previous, [columnName, options]) => (Object.assign(Object.assign({}, previous), { [columnName]: Object.assign(Object.assign({}, options), { primaryKey: false }) })), {});
    }
    const comments = Object.entries(columnsWithOptions)
        .map(([columnName, { comment }]) => {
        return (typeof comment !== 'undefined' &&
            (0, utils_1.makeComment)('COLUMN', `${mOptions.literal(tableName)}.${mOptions.literal(columnName)}`, comment));
    })
        .filter((comment) => Boolean(comment));
    return {
        columns: Object.entries(columnsWithOptions).map(([columnName, options]) => {
            const { type, collation, default: defaultValue, unique, primaryKey, notNull, check, references, referencesConstraintName, referencesConstraintComment, deferrable, expressionGenerated, } = options;
            const sequenceGenerated = options.sequenceGenerated === undefined ? options.generated : options.sequenceGenerated;
            const constraints = [];
            if (collation) {
                constraints.push(`COLLATE ${collation}`);
            }
            if (defaultValue !== undefined) {
                constraints.push(`DEFAULT ${(0, utils_1.escapeValue)(defaultValue)}`);
            }
            if (unique) {
                constraints.push('UNIQUE');
            }
            if (primaryKey) {
                constraints.push('PRIMARY KEY');
            }
            if (notNull) {
                constraints.push('NOT NULL');
            }
            if (check) {
                constraints.push(`CHECK (${check})`);
            }
            if (references) {
                const name = referencesConstraintName || (referencesConstraintComment ? `${tableName}_fk_${columnName}` : '');
                const constraintName = name ? `CONSTRAINT ${mOptions.literal(name)} ` : '';
                constraints.push(`${constraintName}${parseReferences(options, mOptions.literal)}`);
                if (referencesConstraintComment) {
                    comments.push((0, utils_1.makeComment)(`CONSTRAINT ${mOptions.literal(name)} ON`, mOptions.literal(tableName), referencesConstraintComment));
                }
            }
            if (deferrable) {
                constraints.push(parseDeferrable(options));
            }
            if (sequenceGenerated) {
                const sequenceOptions = (0, sequences_1.parseSequenceOptions)(extendingTypeShorthands, sequenceGenerated).join(' ');
                constraints.push(`GENERATED ${sequenceGenerated.precedence} AS IDENTITY${sequenceOptions ? ` (${sequenceOptions})` : ''}`);
            }
            if (expressionGenerated) {
                constraints.push(`GENERATED ALWAYS AS (${expressionGenerated}) STORED`);
            }
            const constraintsStr = constraints.length ? ` ${constraints.join(' ')}` : '';
            const sType = typeof type === 'object' ? mOptions.literal(type) : type;
            return `${mOptions.literal(columnName)} ${sType}${constraintsStr}`;
        }),
        constraints: multiplePrimaryColumns ? { primaryKey: primaryColumns } : {},
        comments,
    };
};
const parseConstraints = (table, options, optionName, literal) => {
    const { check, unique, primaryKey, foreignKeys, exclude, deferrable, comment } = options;
    const tableName = typeof table === 'object' ? table.name : table;
    let constraints = [];
    const comments = [];
    if (check) {
        if (Array.isArray(check)) {
            check.forEach((ch, i) => {
                const name = literal(optionName || `${tableName}_chck_${i + 1}`);
                constraints.push(`CONSTRAINT ${name} CHECK (${ch})`);
            });
        }
        else {
            const name = literal(optionName || `${tableName}_chck`);
            constraints.push(`CONSTRAINT ${name} CHECK (${check})`);
        }
    }
    if (unique) {
        const uniqueArray = Array.isArray(unique) ? unique : [unique];
        const isArrayOfArrays = uniqueArray.some((uniqueSet) => Array.isArray(uniqueSet));
        (isArrayOfArrays ? uniqueArray : [uniqueArray]).forEach((uniqueSet) => {
            const cols = Array.isArray(uniqueSet) ? uniqueSet : [uniqueSet];
            const name = literal(optionName || `${tableName}_uniq_${cols.join('_')}`);
            constraints.push(`CONSTRAINT ${name} UNIQUE (${cols.map(literal).join(', ')})`);
        });
    }
    if (primaryKey) {
        const name = literal(optionName || `${tableName}_pkey`);
        const key = (Array.isArray(primaryKey) ? primaryKey : [primaryKey]).map(literal).join(', ');
        constraints.push(`CONSTRAINT ${name} PRIMARY KEY (${key})`);
    }
    if (foreignKeys) {
        ;
        (Array.isArray(foreignKeys) ? foreignKeys : [foreignKeys]).forEach((fk) => {
            const { columns, referencesConstraintName, referencesConstraintComment } = fk;
            const cols = Array.isArray(columns) ? columns : [columns];
            const name = literal(referencesConstraintName || optionName || `${tableName}_fk_${cols.join('_')}`);
            const key = cols.map(literal).join(', ');
            const referencesStr = parseReferences(fk, literal);
            constraints.push(`CONSTRAINT ${name} FOREIGN KEY (${key}) ${referencesStr}`);
            if (referencesConstraintComment) {
                comments.push((0, utils_1.makeComment)(`CONSTRAINT ${name} ON`, literal(tableName), referencesConstraintComment));
            }
        });
    }
    if (exclude) {
        const name = literal(optionName || `${tableName}_excl`);
        constraints.push(`CONSTRAINT ${name} EXCLUDE ${exclude}`);
    }
    if (deferrable) {
        constraints = constraints.map((constraint) => `${constraint} ${parseDeferrable(options)}`);
    }
    if (comment) {
        if (!optionName)
            throw new Error('cannot comment on unspecified constraints');
        comments.push((0, utils_1.makeComment)(`CONSTRAINT ${literal(optionName)} ON`, literal(tableName), comment));
    }
    return {
        constraints,
        comments,
    };
};
const parseLike = (like, literal) => {
    const formatOptions = (name, options) => (Array.isArray(options) ? options : [options])
        .filter((option) => option !== undefined)
        .map((option) => ` ${name} ${option}`)
        .join('');
    const table = typeof like === 'string' || !('table' in like) ? like : like.table;
    const options = typeof like === 'string' || !('options' in like) || like.options === undefined
        ? ''
        : [formatOptions('INCLUDING', like.options.including), formatOptions('EXCLUDING', like.options.excluding)].join('');
    return `LIKE ${literal(table)}${options}`;
};
function dropTable(mOptions) {
    const _drop = (tableName, options = {}) => {
        const { ifExists, cascade } = options;
        const ifExistsStr = ifExists ? ' IF EXISTS' : '';
        const cascadeStr = cascade ? ' CASCADE' : '';
        const tableNameStr = mOptions.literal(tableName);
        return `DROP TABLE${ifExistsStr} ${tableNameStr}${cascadeStr};`;
    };
    return _drop;
}
exports.dropTable = dropTable;
function createTable(mOptions) {
    const _create = (tableName, columns, options = {}) => {
        const { temporary, ifNotExists, inherits, like, constraints: optionsConstraints = {}, comment } = options;
        const { columns: columnLines, constraints: crossColumnConstraints, comments: columnComments = [], } = parseColumns(tableName, columns, mOptions);
        const dupes = (0, utils_1.intersection)(Object.keys(optionsConstraints), Object.keys(crossColumnConstraints));
        if (dupes.length > 0) {
            const dupesStr = dupes.join(', ');
            throw new Error(`There is duplicate constraint definition in table and columns options: ${dupesStr}`);
        }
        const constraints = Object.assign(Object.assign({}, optionsConstraints), crossColumnConstraints);
        const { constraints: constraintLines, comments: constraintComments } = parseConstraints(tableName, constraints, '', mOptions.literal);
        const tableDefinition = [...columnLines, ...constraintLines].concat(like ? [parseLike(like, mOptions.literal)] : []);
        const temporaryStr = temporary ? ' TEMPORARY' : '';
        const ifNotExistsStr = ifNotExists ? ' IF NOT EXISTS' : '';
        const inheritsStr = inherits ? ` INHERITS (${mOptions.literal(inherits)})` : '';
        const tableNameStr = mOptions.literal(tableName);
        const createTableQuery = `CREATE${temporaryStr} TABLE${ifNotExistsStr} ${tableNameStr} (
${(0, utils_1.formatLines)(tableDefinition)}
)${inheritsStr};`;
        const comments = [...columnComments, ...constraintComments];
        if (typeof comment !== 'undefined') {
            comments.push((0, utils_1.makeComment)('TABLE', mOptions.literal(tableName), comment));
        }
        return `${createTableQuery}${comments.length > 0 ? `\n${comments.join('\n')}` : ''}`;
    };
    _create.reverse = dropTable(mOptions);
    return _create;
}
exports.createTable = createTable;
function alterTable(mOptions) {
    const _alter = (tableName, options) => {
        const alterDefinition = [];
        if (options.levelSecurity) {
            alterDefinition.push(`${options.levelSecurity} ROW LEVEL SECURITY`);
        }
        return `ALTER TABLE ${mOptions.literal(tableName)}
  ${(0, utils_1.formatLines)(alterDefinition)};`;
    };
    return _alter;
}
exports.alterTable = alterTable;
function dropColumns(mOptions) {
    const _drop = (tableName, columns, options = {}) => {
        const { ifExists, cascade } = options;
        if (typeof columns === 'string') {
            columns = [columns];
        }
        else if (!Array.isArray(columns) && typeof columns === 'object') {
            columns = Object.keys(columns);
        }
        const columnsStr = (0, utils_1.formatLines)(columns.map(mOptions.literal), `  DROP ${ifExists ? ' IF EXISTS' : ''}`, `${cascade ? ' CASCADE' : ''},`);
        return `ALTER TABLE ${mOptions.literal(tableName)}
${columnsStr};`;
    };
    return _drop;
}
exports.dropColumns = dropColumns;
function addColumns(mOptions) {
    const _add = (tableName, columns, options = {}) => {
        const { ifNotExists } = options;
        const { columns: columnLines, comments: columnComments = [] } = parseColumns(tableName, columns, mOptions);
        const columnsStr = (0, utils_1.formatLines)(columnLines, `  ADD ${ifNotExists ? 'IF NOT EXISTS ' : ''}`);
        const tableNameStr = mOptions.literal(tableName);
        const alterTableQuery = `ALTER TABLE ${tableNameStr}\n${columnsStr};`;
        const columnCommentsStr = columnComments.length > 0 ? `\n${columnComments.join('\n')}` : '';
        return `${alterTableQuery}${columnCommentsStr}`;
    };
    _add.reverse = dropColumns(mOptions);
    return _add;
}
exports.addColumns = addColumns;
function alterColumn(mOptions) {
    return (tableName, columnName, options) => {
        const { default: defaultValue, type, collation, using, notNull, allowNull, comment } = options;
        const sequenceGenerated = options.sequenceGenerated === undefined ? options.generated : options.sequenceGenerated;
        const actions = [];
        if (defaultValue === null) {
            actions.push('DROP DEFAULT');
        }
        else if (defaultValue !== undefined) {
            actions.push(`SET DEFAULT ${(0, utils_1.escapeValue)(defaultValue)}`);
        }
        if (type) {
            const typeStr = (0, utils_1.applyTypeAdapters)(type);
            const collationStr = collation ? ` COLLATE ${collation}` : '';
            const usingStr = using ? ` USING ${using}` : '';
            actions.push(`SET DATA TYPE ${typeStr}${collationStr}${usingStr}`);
        }
        if (notNull) {
            actions.push('SET NOT NULL');
        }
        else if (notNull === false || allowNull) {
            actions.push('DROP NOT NULL');
        }
        if (sequenceGenerated !== undefined) {
            if (!sequenceGenerated) {
                actions.push('DROP IDENTITY');
            }
            else {
                const sequenceOptions = (0, sequences_1.parseSequenceOptions)(mOptions.typeShorthands, sequenceGenerated).join(' ');
                actions.push(`ADD GENERATED ${sequenceGenerated.precedence} AS IDENTITY${sequenceOptions ? ` (${sequenceOptions})` : ''}`);
            }
        }
        const queries = [];
        if (actions.length > 0) {
            const columnsStr = (0, utils_1.formatLines)(actions, `  ALTER ${mOptions.literal(columnName)} `);
            queries.push(`ALTER TABLE ${mOptions.literal(tableName)}\n${columnsStr};`);
        }
        if (typeof comment !== 'undefined') {
            queries.push((0, utils_1.makeComment)('COLUMN', `${mOptions.literal(tableName)}.${mOptions.literal(columnName)}`, comment));
        }
        return queries.join('\n');
    };
}
exports.alterColumn = alterColumn;
function renameTable(mOptions) {
    const _rename = (tableName, newName) => {
        const tableNameStr = mOptions.literal(tableName);
        const newNameStr = mOptions.literal(newName);
        return `ALTER TABLE ${tableNameStr} RENAME TO ${newNameStr};`;
    };
    _rename.reverse = (tableName, newName) => _rename(newName, tableName);
    return _rename;
}
exports.renameTable = renameTable;
function renameColumn(mOptions) {
    const _rename = (tableName, columnName, newName) => {
        const tableNameStr = mOptions.literal(tableName);
        const columnNameStr = mOptions.literal(columnName);
        const newNameStr = mOptions.literal(newName);
        return `ALTER TABLE ${tableNameStr} RENAME ${columnNameStr} TO ${newNameStr};`;
    };
    _rename.reverse = (tableName, columnName, newName) => _rename(tableName, newName, columnName);
    return _rename;
}
exports.renameColumn = renameColumn;
function renameConstraint(mOptions) {
    const _rename = (tableName, constraintName, newName) => {
        const tableNameStr = mOptions.literal(tableName);
        const constraintNameStr = mOptions.literal(constraintName);
        const newNameStr = mOptions.literal(newName);
        return `ALTER TABLE ${tableNameStr} RENAME CONSTRAINT ${constraintNameStr} TO ${newNameStr};`;
    };
    _rename.reverse = (tableName, constraintName, newName) => _rename(tableName, newName, constraintName);
    return _rename;
}
exports.renameConstraint = renameConstraint;
function dropConstraint(mOptions) {
    const _drop = (tableName, constraintName, options = {}) => {
        const { ifExists, cascade } = options;
        const ifExistsStr = ifExists ? ' IF EXISTS' : '';
        const cascadeStr = cascade ? ' CASCADE' : '';
        const tableNameStr = mOptions.literal(tableName);
        const constraintNameStr = mOptions.literal(constraintName);
        return `ALTER TABLE ${tableNameStr} DROP CONSTRAINT${ifExistsStr} ${constraintNameStr}${cascadeStr};`;
    };
    return _drop;
}
exports.dropConstraint = dropConstraint;
function addConstraint(mOptions) {
    const _add = (tableName, constraintName, expression) => {
        const { constraints, comments } = typeof expression === 'string'
            ? {
                constraints: [`${constraintName ? `CONSTRAINT ${mOptions.literal(constraintName)} ` : ''}${expression}`],
                comments: [],
            }
            : parseConstraints(tableName, expression, constraintName, mOptions.literal);
        const constraintStr = (0, utils_1.formatLines)(constraints, '  ADD ');
        return [`ALTER TABLE ${mOptions.literal(tableName)}\n${constraintStr};`, ...comments].join('\n');
    };
    _add.reverse = (tableName, constraintName, options) => {
        if (constraintName === null) {
            throw new Error(`Impossible to automatically infer down migration for addConstraint without naming constraint`);
        }
        return dropConstraint(mOptions)(tableName, constraintName, options);
    };
    return _add;
}
exports.addConstraint = addConstraint;
