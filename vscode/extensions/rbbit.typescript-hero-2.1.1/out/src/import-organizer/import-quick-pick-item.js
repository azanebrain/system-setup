"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ImportQuickPickItem {
    constructor(declarationInfo) {
        this.declarationInfo = declarationInfo;
        this.description = this.declarationInfo.from;
        this.label = this.declarationInfo.declaration.name;
    }
}
exports.default = ImportQuickPickItem;
