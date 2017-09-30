"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseStructureTreeItem_1 = require("./BaseStructureTreeItem");
class DisabledStructureTreeItem extends BaseStructureTreeItem_1.BaseStructureTreeItem {
    constructor() {
        super('Feature is disabled.');
    }
}
exports.DisabledStructureTreeItem = DisabledStructureTreeItem;
