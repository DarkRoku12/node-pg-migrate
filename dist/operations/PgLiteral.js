"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PgLiteral {
    constructor(value) {
        this.value = value;
        this.literal = true;
    }
    static create(str) {
        return new PgLiteral(str);
    }
    toString() {
        return this.value;
    }
}
exports.default = PgLiteral;
