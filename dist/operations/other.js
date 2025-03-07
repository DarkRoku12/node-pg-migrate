"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sql = void 0;
const utils_1 = require("../utils");
function sql(mOptions) {
    const t = (0, utils_1.createTransformer)(mOptions.literal);
    return (sqlStr, args) => {
        let s = t(sqlStr, args);
        if (s.lastIndexOf(';') !== s.length - 1) {
            s += ';';
        }
        return s;
    };
}
exports.sql = sql;
