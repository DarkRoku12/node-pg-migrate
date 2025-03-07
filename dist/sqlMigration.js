"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActions = void 0;
const fs_1 = __importDefault(require("fs"));
const { readFile } = fs_1.default.promises;
const createMigrationCommentRegex = (direction) => new RegExp(`^\\s*--[\\s-]*${direction}\\s+migration`, 'im');
const getActions = (content) => {
    const upMigrationCommentRegex = createMigrationCommentRegex('up');
    const downMigrationCommentRegex = createMigrationCommentRegex('down');
    const upMigrationStart = content.search(upMigrationCommentRegex);
    const downMigrationStart = content.search(downMigrationCommentRegex);
    const upSql = upMigrationStart >= 0
        ? content.substr(upMigrationStart, downMigrationStart < upMigrationStart ? undefined : downMigrationStart)
        : content;
    const downSql = downMigrationStart >= 0
        ? content.substr(downMigrationStart, upMigrationStart < downMigrationStart ? undefined : upMigrationStart)
        : undefined;
    return {
        up: (pgm) => pgm.sql(upSql),
        down: downSql === undefined ? false : (pgm) => pgm.sql(downSql),
    };
};
exports.getActions = getActions;
exports.default = async (sqlPath) => {
    const content = await readFile(sqlPath, 'utf-8');
    return (0, exports.getActions)(content);
};
