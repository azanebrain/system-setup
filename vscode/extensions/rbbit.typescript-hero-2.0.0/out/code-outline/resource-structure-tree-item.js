"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const base_structure_tree_item_1 = require("./base-structure-tree-item");
const declaration_structure_tree_item_1 = require("./declaration-structure-tree-item");
const imports_structure_tree_item_1 = require("./imports-structure-tree-item");
class ResourceStructureTreeItem extends base_structure_tree_item_1.default {
    constructor(resource, context) {
        super(resource.identifier);
        this.resource = resource;
        this.context = context;
        this.collapsibleState = vscode_1.TreeItemCollapsibleState.Collapsed;
        this.iconPath = this.context.asAbsolutePath('./src/assets/icons/declarations/module.svg');
    }
    getChildren() {
        const items = [];
        if (this.resource.imports && this.resource.imports.length) {
            items.push(new imports_structure_tree_item_1.ImportsStructureTreeItem(this.resource, this.context));
        }
        items.push(...this.resource.resources.map(r => new ResourceStructureTreeItem(r, this.context)));
        items.push(...this.resource.declarations.map(d => new declaration_structure_tree_item_1.default(d, this.context)));
        return items;
    }
}
exports.default = ResourceStructureTreeItem;
