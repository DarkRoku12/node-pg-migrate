"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration = exports.getTimestamp = exports.loadMigrationFiles = exports.FilenameFormat = void 0;
const fs_1 = __importDefault(require("fs"));
const mkdirp_1 = __importDefault(require("mkdirp"));
const path_1 = __importDefault(require("path"));
const migration_builder_1 = __importDefault(require("./migration-builder"));
const utils_1 = require("./utils");
const { readdir } = fs_1.default.promises;
var FilenameFormat;
(function (FilenameFormat) {
    FilenameFormat["timestamp"] = "timestamp";
    FilenameFormat["utc"] = "utc";
})(FilenameFormat = exports.FilenameFormat || (exports.FilenameFormat = {}));
const SEPARATOR = '_';
const loadMigrationFiles = async (dir, ignorePattern) => {
    const dirContent = await readdir(`${dir}/`, { withFileTypes: true });
    const files = dirContent
        .map((file) => (file.isFile() || file.isSymbolicLink() ? file.name : null))
        .filter((file) => Boolean(file))
        .sort();
    const filter = new RegExp(`^(${ignorePattern})$`);
    return ignorePattern === undefined ? files : files.filter((i) => !filter.test(i));
};
exports.loadMigrationFiles = loadMigrationFiles;
const getSuffixFromFileName = (fileName) => path_1.default.extname(fileName).substr(1);
const getLastSuffix = async (dir, ignorePattern) => {
    try {
        const files = await (0, exports.loadMigrationFiles)(dir, ignorePattern);
        return files.length > 0 ? getSuffixFromFileName(files[files.length - 1]) : undefined;
    }
    catch (err) {
        return undefined;
    }
};
const getTimestamp = (logger, filename) => {
    const prefix = filename.split(SEPARATOR)[0];
    if (prefix && /^\d+$/.test(prefix)) {
        if (prefix.length === 13) {
            return Number(prefix);
        }
        if (prefix && prefix.length === 17) {
            const year = prefix.substr(0, 4);
            const month = prefix.substr(4, 2);
            const date = prefix.substr(6, 2);
            const hours = prefix.substr(8, 2);
            const minutes = prefix.substr(10, 2);
            const seconds = prefix.substr(12, 2);
            const ms = prefix.substr(14);
            return new Date(`${year}-${month}-${date}T${hours}:${minutes}:${seconds}.${ms}Z`).valueOf();
        }
    }
    return Number(prefix) || 0;
};
exports.getTimestamp = getTimestamp;
const resolveSuffix = async (directory, { language, ignorePattern }) => language || (await getLastSuffix(directory, ignorePattern)) || 'js';
class Migration {
    constructor(db, migrationPath, { up, down }, options, typeShorthands, logger = console) {
        this.db = db;
        this.path = migrationPath;
        this.name = path_1.default.basename(migrationPath, path_1.default.extname(migrationPath));
        this.timestamp = (0, exports.getTimestamp)(logger, this.name);
        this.up = up;
        this.down = down;
        this.options = options;
        this.typeShorthands = typeShorthands;
        this.logger = logger;
    }
    static async create(name, directory, _language, _ignorePattern, _filenameFormat) {
        if (typeof _language === 'string') {
            console.warn('This usage is deprecated. Please use this method with options object argument');
        }
        const options = typeof _language === 'object'
            ? _language
            : { language: _language, ignorePattern: _ignorePattern, filenameFormat: _filenameFormat };
        const { filenameFormat = FilenameFormat.timestamp } = options;
        mkdirp_1.default.sync(directory);
        const now = new Date();
        const time = filenameFormat === FilenameFormat.utc ? now.toISOString().replace(/[^\d]/g, '') : now.valueOf();
        const templateFileName = 'templateFileName' in options
            ? path_1.default.resolve(process.cwd(), options.templateFileName)
            : path_1.default.resolve(__dirname, `../templates/migration-template.${await resolveSuffix(directory, options)}`);
        const suffix = getSuffixFromFileName(templateFileName);
        const newFile = `${directory}/${time}${SEPARATOR}${name}.${suffix}`;
        await new Promise((resolve, reject) => {
            fs_1.default.createReadStream(templateFileName)
                .pipe(fs_1.default.createWriteStream(newFile))
                .on('close', resolve)
                .on('error', reject);
        });
        return newFile;
    }
    _getMarkAsRun(action) {
        const schema = (0, utils_1.getMigrationTableSchema)(this.options);
        const { migrationsTable } = this.options;
        const { name } = this;
        switch (action) {
            case this.down:
                this.logger.info(`### MIGRATION ${this.name} (DOWN) ###`);
                return `DELETE FROM "${schema}"."${migrationsTable}" WHERE name='${name}';`;
            case this.up:
                this.logger.info(`### MIGRATION ${this.name} (UP) ###`);
                return `INSERT INTO "${schema}"."${migrationsTable}" (name, run_on) VALUES ('${name}', NOW());`;
            default:
                throw new Error('Unknown direction');
        }
    }
    async _apply(action, pgm) {
        if (action.length === 2) {
            await new Promise((resolve) => {
                action(pgm, resolve);
            });
        }
        else {
            await action(pgm);
        }
        const sqlSteps = pgm.getSqlSteps();
        sqlSteps.push(this._getMarkAsRun(action));
        if (!this.options.singleTransaction && pgm.isUsingTransaction()) {
            sqlSteps.unshift('BEGIN;');
            sqlSteps.push('COMMIT;');
        }
        else if (this.options.singleTransaction && !pgm.isUsingTransaction()) {
            this.logger.warn('#> WARNING: Need to break single transaction! <');
            sqlSteps.unshift('COMMIT;');
            sqlSteps.push('BEGIN;');
        }
        else if (!this.options.singleTransaction || !pgm.isUsingTransaction()) {
            this.logger.warn('#> WARNING: This migration is not wrapped in a transaction! <');
        }
        if (typeof this.logger.debug === 'function') {
            this.logger.debug(`${sqlSteps.join('\n')}\n\n`);
        }
        return sqlSteps.reduce((promise, sql) => promise.then(() => this.options.dryRun || this.db.query(sql)), Promise.resolve());
    }
    _getAction(direction) {
        if (direction === 'down' && this.down === undefined) {
            this.down = this.up;
        }
        const action = this[direction];
        if (action === false) {
            throw new Error(`User has disabled ${direction} migration on file: ${this.name}`);
        }
        if (typeof action !== 'function') {
            throw new Error(`Unknown value for direction: ${direction}. Is the migration ${this.name} exporting a '${direction}' function?`);
        }
        return action;
    }
    apply(direction) {
        const pgm = new migration_builder_1.default(this.db, this.typeShorthands, Boolean(this.options.decamelize), this.logger);
        const action = this._getAction(direction);
        if (this.down === this.up) {
            pgm.enableReverseMode();
        }
        return this._apply(action, pgm);
    }
    markAsRun(direction) {
        return this.db.query(this._getMarkAsRun(this._getAction(direction)));
    }
}
exports.Migration = Migration;
