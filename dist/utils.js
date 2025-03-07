"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.intersection = exports.formatLines = exports.makeComment = exports.formatParams = exports.applyType = exports.applyTypeAdapters = exports.getMigrationTableSchema = exports.getSchemas = exports.createTransformer = exports.escapeValue = exports.StringIdGenerator = exports.createSchemalize = void 0;
const decamelize_1 = __importDefault(require("decamelize"));
const identity = (v) => v;
const quote = (str) => `"${str}"`;
const createSchemalize = (shouldDecamelize, shouldQuote) => {
    const transform = [shouldDecamelize ? decamelize_1.default : identity, shouldQuote ? quote : identity].reduce((acc, fn) => fn === identity ? acc : (x) => acc(fn(x)));
    return (v) => {
        if (typeof v === 'object') {
            const { schema, name } = v;
            return (schema ? `${transform(schema)}.` : '') + transform(name);
        }
        return transform(v);
    };
};
exports.createSchemalize = createSchemalize;
class StringIdGenerator {
    constructor(chars = 'abcdefghijklmnopqrstuvwxyz') {
        this.chars = chars;
        this.ids = [0];
    }
    next() {
        const idsChars = this.ids.map((id) => this.chars[id]);
        this.increment();
        return idsChars.join('');
    }
    increment() {
        for (let i = this.ids.length - 1; i >= 0; i -= 1) {
            this.ids[i] += 1;
            if (this.ids[i] < this.chars.length) {
                return;
            }
            this.ids[i] = 0;
        }
        this.ids.unshift(0);
    }
}
exports.StringIdGenerator = StringIdGenerator;
const isPgLiteral = (val) => typeof val === 'object' && val !== null && 'literal' in val && val.literal === true;
const escapeValue = (val) => {
    if (val === null) {
        return 'NULL';
    }
    if (typeof val === 'boolean') {
        return val.toString();
    }
    if (typeof val === 'string') {
        let dollars;
        const ids = new StringIdGenerator();
        let index;
        do {
            index = ids.next();
            dollars = `$pg${index}$`;
        } while (val.indexOf(dollars) >= 0);
        return `${dollars}${val}${dollars}`;
    }
    if (typeof val === 'number') {
        return val;
    }
    if (Array.isArray(val)) {
        const arrayStr = val.map(exports.escapeValue).join(',').replace(/ARRAY/g, '');
        return `ARRAY[${arrayStr}]`;
    }
    if (isPgLiteral(val)) {
        return val.value;
    }
    return '';
};
exports.escapeValue = escapeValue;
const createTransformer = (literal) => (s, d) => Object.keys(d || {}).reduce((str, p) => {
    const v = d === null || d === void 0 ? void 0 : d[p];
    return str.replace(new RegExp(`{${p}}`, 'g'), v === undefined
        ? ''
        : typeof v === 'string' || (typeof v === 'object' && v !== null && 'name' in v)
            ? literal(v)
            : String((0, exports.escapeValue)(v)));
}, s);
exports.createTransformer = createTransformer;
const getSchemas = (schema) => {
    const schemas = (Array.isArray(schema) ? schema : [schema]).filter((s) => typeof s === 'string' && s.length > 0);
    return schemas.length > 0 ? schemas : ['public'];
};
exports.getSchemas = getSchemas;
const getMigrationTableSchema = (options) => options.migrationsSchema !== undefined ? options.migrationsSchema : (0, exports.getSchemas)(options.schema)[0];
exports.getMigrationTableSchema = getMigrationTableSchema;
const typeAdapters = {
    int: 'integer',
    string: 'text',
    float: 'real',
    double: 'double precision',
    datetime: 'timestamp',
    bool: 'boolean',
};
const defaultTypeShorthands = {
    id: { type: 'serial', primaryKey: true },
};
const applyTypeAdapters = (type) => type in typeAdapters ? typeAdapters[type] : type;
exports.applyTypeAdapters = applyTypeAdapters;
const toType = (type) => (typeof type === 'string' ? { type } : type);
const removeType = (_a) => {
    var { type } = _a, rest = __rest(_a, ["type"]);
    return rest;
};
const applyType = (type, extendingTypeShorthands = {}) => {
    var _a;
    const typeShorthands = Object.assign(Object.assign({}, defaultTypeShorthands), extendingTypeShorthands);
    const options = toType(type);
    let ext = null;
    const types = [options.type];
    while (typeShorthands[types[types.length - 1]]) {
        ext = Object.assign(Object.assign({}, toType(typeShorthands[types[types.length - 1]])), (ext === null ? {} : removeType(ext)));
        if (types.includes(ext.type)) {
            throw new Error(`Shorthands contain cyclic dependency: ${types.join(', ')}, ${ext.type}`);
        }
        else {
            types.push(ext.type);
        }
    }
    return Object.assign(Object.assign(Object.assign({}, ext), options), { type: (0, exports.applyTypeAdapters)((_a = ext === null || ext === void 0 ? void 0 : ext.type) !== null && _a !== void 0 ? _a : options.type) });
};
exports.applyType = applyType;
const formatParam = (mOptions) => (param) => {
    const { mode, name, type, default: defaultValue } = (0, exports.applyType)(param, mOptions.typeShorthands);
    const options = [];
    if (mode) {
        options.push(mode);
    }
    if (name) {
        options.push(mOptions.literal(name));
    }
    if (type) {
        options.push(type);
    }
    if (defaultValue) {
        options.push(`DEFAULT ${(0, exports.escapeValue)(defaultValue)}`);
    }
    return options.join(' ');
};
const formatParams = (params, mOptions) => `(${params.map(formatParam(mOptions)).join(', ')})`;
exports.formatParams = formatParams;
const makeComment = (object, name, text) => {
    const cmt = (0, exports.escapeValue)(text || null);
    return `COMMENT ON ${object} ${name} IS ${cmt};`;
};
exports.makeComment = makeComment;
const formatLines = (lines, replace = '  ', separator = ',') => lines
    .map((line) => line.replace(/(?:\r\n|\r|\n)+/g, ' '))
    .join(`${separator}\n`)
    .replace(/^/gm, replace);
exports.formatLines = formatLines;
function intersection(list1, list2) {
    return list1.filter((element) => list2.includes(element));
}
exports.intersection = intersection;
