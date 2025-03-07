"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const domains = __importStar(require("./operations/domains"));
const extensions = __importStar(require("./operations/extensions"));
const functions = __importStar(require("./operations/functions"));
const indexes = __importStar(require("./operations/indexes"));
const operators = __importStar(require("./operations/operators"));
const other = __importStar(require("./operations/other"));
const policies = __importStar(require("./operations/policies"));
const roles = __importStar(require("./operations/roles"));
const schemas = __importStar(require("./operations/schemas"));
const sequences = __importStar(require("./operations/sequences"));
const tables = __importStar(require("./operations/tables"));
const triggers = __importStar(require("./operations/triggers"));
const types = __importStar(require("./operations/types"));
const views = __importStar(require("./operations/views"));
const mViews = __importStar(require("./operations/viewsMaterialized"));
const PgLiteral_1 = __importDefault(require("./operations/PgLiteral"));
class MigrationBuilderImpl {
    constructor(db, typeShorthands, shouldDecamelize, logger) {
        this._steps = [];
        this._REVERSE_MODE = false;
        this._useTransaction = true;
        const wrap = (operation) => (...args) => {
            if (this._REVERSE_MODE) {
                if (typeof operation.reverse !== 'function') {
                    const name = `pgm.${operation.name}()`;
                    throw new Error(`Impossible to automatically infer down migration for "${name}"`);
                }
                this._steps = this._steps.concat(operation.reverse(...args));
            }
            else {
                this._steps = this._steps.concat(operation(...args));
            }
        };
        const options = {
            typeShorthands,
            schemalize: (0, utils_1.createSchemalize)(shouldDecamelize, false),
            literal: (0, utils_1.createSchemalize)(shouldDecamelize, true),
            logger,
        };
        this.createExtension = wrap(extensions.createExtension(options));
        this.dropExtension = wrap(extensions.dropExtension(options));
        this.addExtension = this.createExtension;
        this.createTable = wrap(tables.createTable(options));
        this.dropTable = wrap(tables.dropTable(options));
        this.renameTable = wrap(tables.renameTable(options));
        this.alterTable = wrap(tables.alterTable(options));
        this.addColumns = wrap(tables.addColumns(options));
        this.dropColumns = wrap(tables.dropColumns(options));
        this.renameColumn = wrap(tables.renameColumn(options));
        this.alterColumn = wrap(tables.alterColumn(options));
        this.addColumn = this.addColumns;
        this.dropColumn = this.dropColumns;
        this.addConstraint = wrap(tables.addConstraint(options));
        this.dropConstraint = wrap(tables.dropConstraint(options));
        this.renameConstraint = wrap(tables.renameConstraint(options));
        this.createConstraint = this.addConstraint;
        this.createType = wrap(types.createType(options));
        this.dropType = wrap(types.dropType(options));
        this.addType = this.createType;
        this.renameType = wrap(types.renameType(options));
        this.renameTypeAttribute = wrap(types.renameTypeAttribute(options));
        this.renameTypeValue = wrap(types.renameTypeValue(options));
        this.addTypeAttribute = wrap(types.addTypeAttribute(options));
        this.dropTypeAttribute = wrap(types.dropTypeAttribute(options));
        this.setTypeAttribute = wrap(types.setTypeAttribute(options));
        this.addTypeValue = wrap(types.addTypeValue(options));
        this.createIndex = wrap(indexes.createIndex(options));
        this.dropIndex = wrap(indexes.dropIndex(options));
        this.addIndex = this.createIndex;
        this.createRole = wrap(roles.createRole(options));
        this.dropRole = wrap(roles.dropRole(options));
        this.alterRole = wrap(roles.alterRole(options));
        this.renameRole = wrap(roles.renameRole(options));
        this.createFunction = wrap(functions.createFunction(options));
        this.dropFunction = wrap(functions.dropFunction(options));
        this.renameFunction = wrap(functions.renameFunction(options));
        this.createTrigger = wrap(triggers.createTrigger(options));
        this.dropTrigger = wrap(triggers.dropTrigger(options));
        this.renameTrigger = wrap(triggers.renameTrigger(options));
        this.createSchema = wrap(schemas.createSchema(options));
        this.dropSchema = wrap(schemas.dropSchema(options));
        this.renameSchema = wrap(schemas.renameSchema(options));
        this.createDomain = wrap(domains.createDomain(options));
        this.dropDomain = wrap(domains.dropDomain(options));
        this.alterDomain = wrap(domains.alterDomain(options));
        this.renameDomain = wrap(domains.renameDomain(options));
        this.createSequence = wrap(sequences.createSequence(options));
        this.dropSequence = wrap(sequences.dropSequence(options));
        this.alterSequence = wrap(sequences.alterSequence(options));
        this.renameSequence = wrap(sequences.renameSequence(options));
        this.createOperator = wrap(operators.createOperator(options));
        this.dropOperator = wrap(operators.dropOperator(options));
        this.createOperatorClass = wrap(operators.createOperatorClass(options));
        this.dropOperatorClass = wrap(operators.dropOperatorClass(options));
        this.renameOperatorClass = wrap(operators.renameOperatorClass(options));
        this.createOperatorFamily = wrap(operators.createOperatorFamily(options));
        this.dropOperatorFamily = wrap(operators.dropOperatorFamily(options));
        this.renameOperatorFamily = wrap(operators.renameOperatorFamily(options));
        this.addToOperatorFamily = wrap(operators.addToOperatorFamily(options));
        this.removeFromOperatorFamily = wrap(operators.removeFromOperatorFamily(options));
        this.createPolicy = wrap(policies.createPolicy(options));
        this.dropPolicy = wrap(policies.dropPolicy(options));
        this.alterPolicy = wrap(policies.alterPolicy(options));
        this.renamePolicy = wrap(policies.renamePolicy(options));
        this.createView = wrap(views.createView(options));
        this.dropView = wrap(views.dropView(options));
        this.alterView = wrap(views.alterView(options));
        this.alterViewColumn = wrap(views.alterViewColumn(options));
        this.renameView = wrap(views.renameView(options));
        this.createMaterializedView = wrap(mViews.createMaterializedView(options));
        this.dropMaterializedView = wrap(mViews.dropMaterializedView(options));
        this.alterMaterializedView = wrap(mViews.alterMaterializedView(options));
        this.renameMaterializedView = wrap(mViews.renameMaterializedView(options));
        this.renameMaterializedViewColumn = wrap(mViews.renameMaterializedViewColumn(options));
        this.refreshMaterializedView = wrap(mViews.refreshMaterializedView(options));
        this.sql = wrap(other.sql(options));
        this.func = PgLiteral_1.default.create;
        const wrapDB = (operation) => (...args) => {
            if (this._REVERSE_MODE) {
                throw new Error('Impossible to automatically infer down migration');
            }
            return operation(...args);
        };
        this.db = {
            query: wrapDB(db.query),
            select: wrapDB(db.select),
        };
    }
    enableReverseMode() {
        this._REVERSE_MODE = true;
        return this;
    }
    noTransaction() {
        this._useTransaction = false;
        return this;
    }
    isUsingTransaction() {
        return this._useTransaction;
    }
    getSql() {
        return `${this.getSqlSteps().join('\n')}\n`;
    }
    getSqlSteps() {
        return this._REVERSE_MODE ? this._steps.slice().reverse() : this._steps;
    }
}
exports.default = MigrationBuilderImpl;
