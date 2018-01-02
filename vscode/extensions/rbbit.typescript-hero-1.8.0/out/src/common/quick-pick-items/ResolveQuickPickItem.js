"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ResolveQuickPickItem {
    constructor(declarationInfo) {
        this.declarationInfo = declarationInfo;
        this.description = this.declarationInfo.from;
        this.label = this.declarationInfo.declaration.name;
    }
}
exports.ResolveQuickPickItem = ResolveQuickPickItem;
