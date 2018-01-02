"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ClassNotFoundError extends Error {
    constructor(className) {
        super();
        this.message = `The class "${className}" was not found in the given document.`;
    }
}
exports.ClassNotFoundError = ClassNotFoundError;
