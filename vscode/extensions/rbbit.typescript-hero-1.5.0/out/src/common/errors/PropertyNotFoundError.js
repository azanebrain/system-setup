"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PropertyNotFound extends Error {
    constructor(propName, parent) {
        super();
        this.message = `The property "${propName}" was not found${parent ? ` in "${parent}"` : ''}.`;
    }
}
exports.PropertyNotFound = PropertyNotFound;
