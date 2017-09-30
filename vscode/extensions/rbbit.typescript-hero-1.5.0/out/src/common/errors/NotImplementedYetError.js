"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class NotImplementedYetError extends Error {
    constructor() {
        super();
        this.message = 'This feature is not yet implemented.';
    }
}
exports.NotImplementedYetError = NotImplementedYetError;
