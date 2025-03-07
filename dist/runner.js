"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const db_1 = __importDefault(require("./db"));
const migration_1 = require("./migration");
const utils_1 = require("./utils");
const sqlMigration_1 = __importDefault(require("./sqlMigration"));
const PG_MIGRATE_LOCK_ID = 7241865325823964;
const idColumn = 'id';
const nameColumn = 'name';
const runOnColumn = 'run_on';
const loadMigrations = async (db, options, logger) => {
    try {
        let shorthands = {};
        const files = await (0, migration_1.loadMigrationFiles)(options.dir, options.ignorePattern);
        return (await Promise.all(files.map(async (file) => {
            const filePath = `${options.dir}/${file}`;
            const actions = path_1.default.extname(filePath) === '.sql'
                ? await (0, sqlMigration_1.default)(filePath)
                :
                    require(path_1.default.relative(__dirname, filePath));
            shorthands = Object.assign(Object.assign({}, shorthands), actions.shorthands);
            return new migration_1.Migration(db, filePath, actions, options, Object.assign({}, shorthands), logger);
        }))).sort((m1, m2) => {
            const compare = m1.timestamp - m2.timestamp;
            if (compare !== 0)
                return compare;
            return m1.name.localeCompare(m2.name);
        });
    }
    catch (err) {
        throw new Error(`Can't get migration files: ${err.stack}`);
    }
};
const lock = async (db) => {
    const [result] = await db.select(`select pg_try_advisory_lock(${PG_MIGRATE_LOCK_ID}) as "lockObtained"`);
    if (!result.lockObtained) {
        throw new Error('Another migration is already running');
    }
};
const unlock = async (db) => {
    const [result] = await db.select(`select pg_advisory_unlock(${PG_MIGRATE_LOCK_ID}) as "lockReleased"`);
    if (!result.lockReleased) {
        throw new Error('Failed to release migration lock');
    }
};
const ensureMigrationsTable = async (db, options) => {
    try {
        const schema = (0, utils_1.getMigrationTableSchema)(options);
        const { migrationsTable } = options;
        const fullTableName = (0, utils_1.createSchemalize)(Boolean(options.decamelize), true)({
            schema,
            name: migrationsTable,
        });
        const migrationTables = await db.select(`SELECT table_name FROM information_schema.tables WHERE table_schema = '${schema}' AND table_name = '${migrationsTable}'`);
        if (migrationTables && migrationTables.length === 1) {
            const primaryKeyConstraints = await db.select(`SELECT constraint_name FROM information_schema.table_constraints WHERE table_schema = '${schema}' AND table_name = '${migrationsTable}' AND constraint_type = 'PRIMARY KEY'`);
            if (!primaryKeyConstraints || primaryKeyConstraints.length !== 1) {
                await db.query(`ALTER TABLE ${fullTableName} ADD PRIMARY KEY (${idColumn})`);
            }
        }
        else {
            await db.query(`CREATE TABLE ${fullTableName} ( ${idColumn} SERIAL PRIMARY KEY, ${nameColumn} varchar(255) NOT NULL, ${runOnColumn} timestamp NOT NULL)`);
        }
    }
    catch (err) {
        throw new Error(`Unable to ensure migrations table: ${err.stack}`);
    }
};
const getRunMigrations = async (db, options) => {
    const schema = (0, utils_1.getMigrationTableSchema)(options);
    const { migrationsTable } = options;
    const fullTableName = (0, utils_1.createSchemalize)(Boolean(options.decamelize), true)({
        schema,
        name: migrationsTable,
    });
    return db.column(nameColumn, `SELECT ${nameColumn} FROM ${fullTableName} ORDER BY ${runOnColumn}, ${idColumn}`);
};
const getMigrationsToRun = (options, runNames, migrations) => {
    if (options.direction === 'down') {
        const downMigrations = runNames
            .filter((migrationName) => !options.file || options.file === migrationName)
            .map((migrationName) => migrations.find(({ name }) => name === migrationName) || migrationName);
        const { count = 1 } = options;
        const toRun = (options.timestamp
            ? downMigrations.filter((migration) => typeof migration === 'object' && migration.timestamp >= count)
            : downMigrations.slice(-Math.abs(count))).reverse();
        const deletedMigrations = toRun.filter((migration) => typeof migration === 'string');
        if (deletedMigrations.length) {
            const deletedMigrationsStr = deletedMigrations.join(', ');
            throw new Error(`Definitions of migrations ${deletedMigrationsStr} have been deleted.`);
        }
        return toRun;
    }
    const upMigrations = migrations.filter(({ name }) => runNames.indexOf(name) < 0 && (!options.file || options.file === name));
    const { count = Infinity } = options;
    return options.timestamp
        ? upMigrations.filter(({ timestamp }) => timestamp <= count)
        : upMigrations.slice(0, Math.abs(count));
};
const checkOrder = (runNames, migrations) => {
    const len = Math.min(runNames.length, migrations.length);
    for (let i = 0; i < len; i += 1) {
        const runName = runNames[i];
        const migrationName = migrations[i].name;
        if (runName !== migrationName) {
            throw new Error(`Not run migration ${migrationName} is preceding already run migration ${runName}`);
        }
    }
};
const runMigrations = (toRun, method, direction) => toRun.reduce((promise, migration) => promise.then(() => migration[method](direction)), Promise.resolve());
const getLogger = ({ log, logger, verbose }) => {
    let loggerObject = console;
    if (typeof logger === 'object') {
        loggerObject = logger;
    }
    else if (typeof log === 'function') {
        loggerObject = { debug: log, info: log, warn: log, error: log };
    }
    return verbose
        ? loggerObject
        : {
            debug: undefined,
            info: loggerObject.info.bind(loggerObject),
            warn: loggerObject.warn.bind(loggerObject),
            error: loggerObject.error.bind(loggerObject),
        };
};
exports.default = async (options) => {
    const logger = getLogger(options);
    const db = (0, db_1.default)(options.dbClient || options.databaseUrl, logger);
    try {
        await db.createConnection();
        if (!options.noLock) {
            await lock(db);
        }
        if (options.schema) {
            const schemas = (0, utils_1.getSchemas)(options.schema);
            if (options.createSchema) {
                await Promise.all(schemas.map((schema) => db.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`)));
            }
            await db.query(`SET search_path TO ${schemas.map((s) => `"${s}"`).join(', ')}`);
        }
        if (options.migrationsSchema && options.createMigrationsSchema) {
            await db.query(`CREATE SCHEMA IF NOT EXISTS "${options.migrationsSchema}"`);
        }
        await ensureMigrationsTable(db, options);
        const [migrations, runNames] = await Promise.all([
            loadMigrations(db, options, logger),
            getRunMigrations(db, options),
        ]);
        if (options.checkOrder) {
            checkOrder(runNames, migrations);
        }
        const toRun = getMigrationsToRun(options, runNames, migrations);
        if (!toRun.length) {
            logger.info('No migrations to run!');
            return [];
        }
        logger.info('> Migrating files:');
        toRun.forEach((m) => {
            logger.info(`> - ${m.name}`);
        });
        if (options.fake) {
            await runMigrations(toRun, 'markAsRun', options.direction);
        }
        else if (options.singleTransaction) {
            await db.query('BEGIN');
            try {
                await runMigrations(toRun, 'apply', options.direction);
                await db.query('COMMIT');
            }
            catch (err) {
                logger.warn('> Rolling back attempted migration ...');
                await db.query('ROLLBACK');
                throw err;
            }
        }
        else {
            await runMigrations(toRun, 'apply', options.direction);
        }
        return toRun.map((m) => ({
            path: m.path,
            name: m.name,
            timestamp: m.timestamp,
        }));
    }
    finally {
        if (db.connected()) {
            if (!options.noLock) {
                await unlock(db).catch((error) => logger.warn(error.message));
            }
            db.close();
        }
    }
};
