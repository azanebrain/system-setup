"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseStructureTreeItem_1 = require("./BaseStructureTreeItem");
class NotParseableStructureTreeItem extends BaseStructureTreeItem_1.BaseStructureTreeItem {
    constructor() {
        super('File not parseable.');
    }
}
exports.NotParseableStructureTreeItem = NotParseableStructureTreeItem;
