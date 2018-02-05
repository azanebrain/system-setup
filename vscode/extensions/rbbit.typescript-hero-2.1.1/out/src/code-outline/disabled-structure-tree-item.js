"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_structure_tree_item_1 = require("./base-structure-tree-item");
class DisabledStructureTreeItem extends base_structure_tree_item_1.default {
    constructor() {
        super('Feature is disabled.');
    }
}
exports.default = DisabledStructureTreeItem;
