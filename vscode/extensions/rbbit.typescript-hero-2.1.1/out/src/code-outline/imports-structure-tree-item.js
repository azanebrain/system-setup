"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typescript_parser_1 = require("typescript-parser");
const vscode_1 = require("vscode");
const base_structure_tree_item_1 = require("./base-structure-tree-item");
class ImportSpecifierStructureTreeItem extends base_structure_tree_item_1.default {
    constructor(name, tsImport, context) {
        super(name);
        this.iconPath = context.asAbsolutePath('./src/assets/icons/declarations/default.svg');
        this.command = this.createJumpToCommand([tsImport]);
    }
}
exports.ImportSpecifierStructureTreeItem = ImportSpecifierStructureTreeItem;
class ImportStructureTreeItem extends base_structure_tree_item_1.default {
    constructor(tsImport, context) {
        super(tsImport.libraryName);
        this.tsImport = tsImport;
        this.context = context;
        this.iconPath = context.asAbsolutePath('./src/assets/icons/declarations/import.svg');
        this.command = this.createJumpToCommand([tsImport]);
        if (!(tsImport instanceof typescript_parser_1.StringImport)) {
            this.collapsibleState = vscode_1.TreeItemCollapsibleState.Collapsed;
        }
    }
    getChildren() {
        const imp = this.tsImport;
        if (imp instanceof typescript_parser_1.ExternalModuleImport) {
            return [new ImportSpecifierStructureTreeItem(imp.alias, imp, this.context)];
        }
        if (imp instanceof typescript_parser_1.NamedImport) {
            const specifiers = imp.specifiers.map(s => new ImportSpecifierStructureTreeItem(`${s.specifier}${s.alias ? ` as ${s.alias}` : ''}`, imp, this.context));
            if (imp.defaultAlias) {
                specifiers.unshift(new ImportSpecifierStructureTreeItem(`(default) ${imp.defaultAlias}`, imp, this.context));
            }
            return specifiers;
        }
        if (imp instanceof typescript_parser_1.NamespaceImport) {
            return [new ImportSpecifierStructureTreeItem(imp.alias, imp, this.context)];
        }
        return [];
    }
}
exports.ImportStructureTreeItem = ImportStructureTreeItem;
class ImportsStructureTreeItem extends base_structure_tree_item_1.default {
    constructor(resource, context) {
        super('Imports');
        this.resource = resource;
        this.context = context;
        this.collapsibleState = vscode_1.TreeItemCollapsibleState.Collapsed;
        this.iconPath = context.asAbsolutePath('./src/assets/icons/declarations/module.svg');
    }
    getChildren() {
        return this.resource.imports.map(i => new ImportStructureTreeItem(i, this.context));
    }
}
exports.ImportsStructureTreeItem = ImportsStructureTreeItem;
