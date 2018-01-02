"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const BaseStructureTreeItem_1 = require("./BaseStructureTreeItem");
const DeclarationStructureTreeItem_1 = require("./DeclarationStructureTreeItem");
const ImportsStructureTreeItem_1 = require("./ImportsStructureTreeItem");
class ResourceStructureTreeItem extends BaseStructureTreeItem_1.BaseStructureTreeItem {
    constructor(resource, context) {
        super(resource.identifier);
        this.resource = resource;
        this.context = context;
        this.collapsibleState = vscode_1.TreeItemCollapsibleState.Collapsed;
        this.iconPath = this.context.asAbsolutePath('./src/extension/assets/icons/declarations/module.svg');
    }
    getChildren() {
        const items = [];
        if (this.resource.imports && this.resource.imports.length) {
            items.push(new ImportsStructureTreeItem_1.ImportsStructureTreeItem(this.resource, this.context));
        }
        items.push(...this.resource.resources.map(r => new ResourceStructureTreeItem(r, this.context)));
        items.push(...this.resource.declarations.map(d => new DeclarationStructureTreeItem_1.DeclarationStructureTreeItem(d, this.context)));
        return items;
    }
}
exports.ResourceStructureTreeItem = ResourceStructureTreeItem;
