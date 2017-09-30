"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Changeable {
    constructor(object, isNew = false, isModified = false, isDeleted = false) {
        this.object = object;
        this.isNew = isNew;
        this.isModified = isModified;
        this.isDeleted = isDeleted;
    }
}
exports.Changeable = Changeable;
