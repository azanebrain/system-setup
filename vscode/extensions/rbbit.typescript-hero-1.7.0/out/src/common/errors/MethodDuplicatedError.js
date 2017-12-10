"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MethodDuplicated extends Error {
    constructor(methodName, parent) {
        super();
        this.message = `The method "${methodName}" is duplicated in "${parent}".`;
    }
}
exports.MethodDuplicated = MethodDuplicated;
