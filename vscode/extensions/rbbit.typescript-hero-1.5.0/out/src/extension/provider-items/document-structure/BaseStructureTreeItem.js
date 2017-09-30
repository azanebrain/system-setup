"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
class BaseStructureTreeItem extends vscode_1.TreeItem {
    constructor(label) {
        super(label);
    }
    getChildren() {
        return [];
    }
    createJumpToCommand(args) {
        return {
            arguments: args,
            title: 'Jump to node',
            command: 'typescriptHero.documentCodeOutline.gotoNode',
        };
    }
}
exports.BaseStructureTreeItem = BaseStructureTreeItem;
