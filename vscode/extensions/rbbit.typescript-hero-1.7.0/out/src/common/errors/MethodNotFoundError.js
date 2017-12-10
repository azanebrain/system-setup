"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MethodNotFound extends Error {
    constructor(methodName, parent) {
        super();
        this.message = `The method "${methodName}" was not found${parent ? ` in "${parent}"` : ''}.`;
    }
}
exports.MethodNotFound = MethodNotFound;
