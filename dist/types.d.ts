import { ClientBase, ClientConfig, QueryArrayResult, QueryResult, QueryArrayConfig, QueryConfig } from 'pg';
import { Name } from './operations/generalTypes';
import * as domains from './operations/domainsTypes';
import * as extensions from './operations/extensionsTypes';
import * as functions from './operations/functionsTypes';
import * as indexes from './operations/indexesTypes';
import * as operators from './operations/operatorsTypes';
import * as other from './operations/othersTypes';
import * as policies from './operations/policiesTypes';
import * as roles from './operations/rolesTypes';
import * as schemas from './operations/schemasTypes';
import * as sequences from './operations/sequencesTypes';
import * as tables from './operations/tablesTypes';
import * as triggers from './operations/triggersTypes';
import * as types from './operations/typesTypes';
import * as views from './operations/viewsTypes';
import * as mViews from './operations/viewsMaterializedTypes';
import PgLiteral from './operations/PgLiteral';
export { ClientConfig, ConnectionConfig } from 'pg';
export interface DB {
    query(queryConfig: QueryArrayConfig, values?: any[]): Promise<QueryArrayResult>;
    query(queryConfig: QueryConfig): Promise<QueryResult>;
    query(queryTextOrConfig: string | QueryConfig, values?: any[]): Promise<QueryResult>;
    select(queryConfig: QueryArrayConfig, values?: any[]): Promise<any[]>;
    select(queryConfig: QueryConfig): Promise<any[]>;
    select(queryTextOrConfig: string | QueryConfig, values?: any[]): Promise<any[]>;
}
export interface MigrationBuilder {
    createExtension: (...args: Parameters<extensions.CreateExtension>) => void;
    dropExtension: (...args: Parameters<extensions.DropExtension>) => void;
    addExtension: (...args: Parameters<extensions.CreateExtension>) => void;
    createTable: (...args: Parameters<tables.CreateTable>) => void;
    dropTable: (...args: Parameters<tables.DropTable>) => void;
    renameTable: (...args: Parameters<tables.RenameTable>) => void;
    alterTable: (...args: Parameters<tables.AlterTable>) => void;
    addColumns: (...args: Parameters<tables.AddColumns>) => void;
    dropColumns: (...args: Parameters<tables.DropColumns>) => void;
    renameColumn: (...args: Parameters<tables.RenameColumn>) => void;
    alterColumn: (...args: Parameters<tables.AlterColumn>) => void;
    addColumn: (...args: Parameters<tables.AddColumns>) => void;
    dropColumn: (...args: Parameters<tables.DropColumns>) => void;
    addConstraint: (...args: Parameters<tables.CreateConstraint>) => void;
    dropConstraint: (...args: Parameters<tables.DropConstraint>) => void;
    renameConstraint: (...args: Parameters<tables.RenameConstraint>) => void;
    createConstraint: (...args: Parameters<tables.CreateConstraint>) => void;
    createType: (...args: Parameters<types.CreateType>) => void;
    dropType: (...args: Parameters<types.DropType>) => void;
    addType: (...args: Parameters<types.CreateType>) => void;
    renameType: (...args: Parameters<types.RenameType>) => void;
    renameTypeAttribute: (...args: Parameters<types.RenameTypeAttribute>) => void;
    renameTypeValue: (...args: Parameters<types.RenameTypeValue>) => void;
    addTypeAttribute: (...args: Parameters<types.AddTypeAttribute>) => void;
    dropTypeAttribute: (...args: Parameters<types.DropTypeAttribute>) => void;
    setTypeAttribute: (...args: Parameters<types.SetTypeAttribute>) => void;
    addTypeValue: (...args: Parameters<types.AddTypeValue>) => void;
    createIndex: (...args: Parameters<indexes.CreateIndex>) => void;
    dropIndex: (...args: Parameters<indexes.DropIndex>) => void;
    addIndex: (...args: Parameters<indexes.CreateIndex>) => void;
    createRole: (...args: Parameters<roles.CreateRole>) => void;
    dropRole: (...args: Parameters<roles.DropRole>) => void;
    alterRole: (...args: Parameters<roles.AlterRole>) => void;
    renameRole: (...args: Parameters<roles.RenameRole>) => void;
    createFunction: (...args: Parameters<functions.CreateFunction>) => void;
    dropFunction: (...args: Parameters<functions.DropFunction>) => void;
    renameFunction: (...args: Parameters<functions.RenameFunction>) => void;
    createTrigger: (...args: Parameters<triggers.CreateTrigger>) => void;
    dropTrigger: (...args: Parameters<triggers.DropTrigger>) => void;
    renameTrigger: (...args: Parameters<triggers.RenameTrigger>) => void;
    createSchema: (...args: Parameters<schemas.CreateSchema>) => void;
    dropSchema: (...args: Parameters<schemas.DropSchema>) => void;
    renameSchema: (...args: Parameters<schemas.RenameSchema>) => void;
    createDomain: (...args: Parameters<domains.CreateDomain>) => void;
    dropDomain: (...args: Parameters<domains.DropDomain>) => void;
    alterDomain: (...args: Parameters<domains.AlterDomain>) => void;
    renameDomain: (...args: Parameters<domains.RenameDomain>) => void;
    createSequence: (...args: Parameters<sequences.CreateSequence>) => void;
    dropSequence: (...args: Parameters<sequences.DropSequence>) => void;
    alterSequence: (...args: Parameters<sequences.AlterSequence>) => void;
    renameSequence: (...args: Parameters<sequences.RenameSequence>) => void;
    createOperator: (...args: Parameters<operators.CreateOperator>) => void;
    dropOperator: (...args: Parameters<operators.DropOperator>) => void;
    createOperatorClass: (...args: Parameters<operators.CreateOperatorClass>) => void;
    dropOperatorClass: (...args: Parameters<operators.DropOperatorClass>) => void;
    renameOperatorClass: (...args: Parameters<operators.RenameOperatorClass>) => void;
    createOperatorFamily: (...args: Parameters<operators.CreateOperatorFamily>) => void;
    dropOperatorFamily: (...args: Parameters<operators.DropOperatorFamily>) => void;
    renameOperatorFamily: (...args: Parameters<operators.RenameOperatorFamily>) => void;
    addToOperatorFamily: (...args: Parameters<operators.AddToOperatorFamily>) => void;
    removeFromOperatorFamily: (...args: Parameters<operators.RemoveFromOperatorFamily>) => void;
    createPolicy: (...args: Parameters<policies.CreatePolicy>) => void;
    dropPolicy: (...args: Parameters<policies.DropPolicy>) => void;
    alterPolicy: (...args: Parameters<policies.AlterPolicy>) => void;
    renamePolicy: (...args: Parameters<policies.RenamePolicy>) => void;
    createView: (...args: Parameters<views.CreateView>) => void;
    dropView: (...args: Parameters<views.DropView>) => void;
    alterView: (...args: Parameters<views.AlterView>) => void;
    alterViewColumn: (...args: Parameters<views.AlterViewColumn>) => void;
    renameView: (...args: Parameters<views.RenameView>) => void;
    createMaterializedView: (...args: Parameters<mViews.CreateMaterializedView>) => void;
    dropMaterializedView: (...args: Parameters<mViews.DropMaterializedView>) => void;
    alterMaterializedView: (...args: Parameters<mViews.AlterMaterializedView>) => void;
    renameMaterializedView: (...args: Parameters<mViews.RenameMaterializedView>) => void;
    renameMaterializedViewColumn: (...args: Parameters<mViews.RenameMaterializedViewColumn>) => void;
    refreshMaterializedView: (...args: Parameters<mViews.RefreshMaterializedView>) => void;
    sql: (...args: Parameters<other.Sql>) => void;
    func: (sql: string) => PgLiteral;
    noTransaction: () => void;
    db: DB;
}
export declare type MigrationAction = (pgm: MigrationBuilder, run?: () => void) => Promise<void> | void;
export declare type Literal = (v: Name) => string;
export declare type LogFn = (msg: string) => void;
export declare type Logger = {
    debug?: LogFn;
    info: LogFn;
    warn: LogFn;
    error: LogFn;
};
export interface MigrationBuilderActions {
    up?: MigrationAction | false;
    down?: MigrationAction | false;
    shorthands?: tables.ColumnDefinitions;
}
export interface MigrationOptions {
    typeShorthands?: tables.ColumnDefinitions;
    schemalize: Literal;
    literal: Literal;
    logger: Logger;
}
export declare enum PgType {
    BIGINT = "bigint",
    INT8 = "int8",
    BIGSERIAL = "bigserial",
    BIT_1 = "bit",
    BIT_VARYING = "bit varying",
    VARBIT = "varbit",
    SERIAL8 = "serial8",
    BOOLEAN = "boolean",
    BOOL = "bool",
    BOX = "box",
    BYTEA = "bytea",
    CHARACTER = "character",
    CHAR = "char",
    CHARACTER_VARYING = "character varying",
    VARCHAR = "varchar",
    CIDR = "cidr",
    CIRCLE = "circle",
    DATE = "date",
    DOUBLE_PRECISION = "double precision",
    INET = "inet",
    INTEGER = "integer",
    INT = "int",
    INT4 = "int4",
    INTERVAL = "interval",
    JSON = "json",
    JSONB = "jsonb",
    LINE = "line",
    LSEG = "lseg",
    MACADDR = "macaddr",
    MONEY = "money",
    NUMERIC = "numeric",
    PATH = "path",
    PG_LSN = "pg_lsn",
    POINT = "point",
    POLYGON = "polygon",
    REAL = "real",
    FLOAT4 = "float4",
    SMALLINT = "smallint",
    INT2 = "int2",
    SMALLSERIAL = "smallserial",
    SERIAL2 = "serial2",
    SERIAL = "serial",
    SERIAL4 = "serial4",
    TEXT = "text",
    TIME = "time",
    TIME_WITHOUT_TIME_ZONE = "without time zone",
    TIME_WITH_TIME_ZONE = "time with time zone",
    TIMETZ = "timetz",
    TIMESTAMP = "timestamp",
    TIMESTAMP_WITHOUT_TIME_ZONE = "timestamp without time zone",
    TIMESTAMP_WITH_TIME_ZONE = "timestamp with time zone",
    TIMESTAMPTZ = "timestamptz",
    TSQUERY = "tsquery",
    TSVECTOR = "tsvector",
    TXID_SNAPSHOT = "txid_snapshot",
    UUID = "uuid",
    XML = "xml"
}
export declare type MigrationDirection = 'up' | 'down';
export interface RunnerOptionConfig {
    /**
     * The table storing which migrations have been run.
     */
    migrationsTable: string;
    /**
     * The schema storing table which migrations have been run.
     *
     * (defaults to same value as `schema`)
     */
    migrationsSchema?: string;
    /**
     * The schema on which migration will be run.
     *
     * @default 'public'
     */
    schema?: string | string[];
    /**
     * The directory containing your migration files.
     */
    dir: string;
    /**
     * Check order of migrations before running them.
     */
    checkOrder?: boolean;
    /**
     * Direction of migration-run.
     */
    direction: MigrationDirection;
    /**
     * Number of migration to run.
     */
    count?: number;
    /**
     * Treats `count` as timestamp.
     */
    timestamp?: boolean;
    /**
     * Regex pattern for file names to ignore (ignores files starting with `.` by default).
     */
    ignorePattern?: string;
    /**
     * Run only migration with this name.
     */
    file?: string;
    dryRun?: boolean;
    /**
     * Creates the configured schema if it doesn't exist.
     */
    createSchema?: boolean;
    /**
     * Creates the configured migration schema if it doesn't exist.
     */
    createMigrationsSchema?: boolean;
    /**
     * Combines all pending migrations into a single transaction so that if any migration fails, all will be rolled back.
     *
     * @default true
     */
    singleTransaction?: boolean;
    /**
     * Disables locking mechanism and checks.
     */
    noLock?: boolean;
    /**
     * Mark migrations as run without actually performing them (use with caution!).
     */
    fake?: boolean;
    /**
     * Runs [`decamelize`](https://github.com/sindresorhus/decamelize) on table/column/etc. names.
     */
    decamelize?: boolean;
    /**
     * Redirect log messages to this function, rather than `console`.
     */
    log?: LogFn;
    /**
     * Redirect messages to this logger object, rather than `console`.
     */
    logger?: Logger;
    /**
     * Print all debug messages like DB queries run (if you switch it on, it will disable `logger.debug` method).
     */
    verbose?: boolean;
}
export interface RunnerOptionUrl {
    /**
     * Connection string or client config which is passed to [new pg.Client](https://node-postgres.com/api/client#constructor)
     */
    databaseUrl: string | ClientConfig;
}
export interface RunnerOptionClient {
    /**
     * Instance of [new pg.Client](https://node-postgres.com/api/client).
     *
     * Instance should be connected to DB and after finishing migration, user is responsible to close connection.
     */
    dbClient: ClientBase;
}
export declare type RunnerOption = RunnerOptionConfig & (RunnerOptionClient | RunnerOptionUrl);
