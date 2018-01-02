"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PropertyDuplicated extends Error {
    constructor(propName, parent) {
        super();
        this.message = `The property "${propName}" is duplicated in "${parent}".`;
    }
}
exports.PropertyDuplicated = PropertyDuplicated;
