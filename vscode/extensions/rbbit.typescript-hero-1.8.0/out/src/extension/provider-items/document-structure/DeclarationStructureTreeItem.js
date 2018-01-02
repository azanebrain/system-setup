"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typescript_parser_1 = require("typescript-parser");
const StringTemplate_1 = require("typescript-parser/utilities/StringTemplate");
const vscode_1 = require("vscode");
const utilityFunctions_1 = require("../../utilities/utilityFunctions");
const BaseStructureTreeItem_1 = require("./BaseStructureTreeItem");
const fileTemplate = StringTemplate_1.stringTemplate `./src/extension/assets/icons/declarations/${0}.svg`;
function getDeclarationLabel(declaration) {
    if (declaration instanceof typescript_parser_1.FunctionDeclaration ||
        declaration instanceof typescript_parser_1.MethodDeclaration) {
        const params = declaration.parameters.map(p => p.name + (p.type ? `: ${p.type}` : '')).join(', ');
        return `${declaration.name}(${params})${declaration.type ? `: ${declaration.type}` : ''}`;
    }
    if (declaration instanceof typescript_parser_1.PropertyDeclaration) {
        return declaration.name + (declaration.type ? `: ${declaration.type}` : '');
    }
    if (declaration instanceof typescript_parser_1.ClassDeclaration ||
        declaration instanceof typescript_parser_1.InterfaceDeclaration) {
        return declaration.name + (declaration.typeParameters ? `<${declaration.typeParameters.join(', ')}>` : '');
    }
    if (declaration instanceof typescript_parser_1.GetterDeclaration ||
        declaration instanceof typescript_parser_1.SetterDeclaration) {
        return `${declaration instanceof typescript_parser_1.GetterDeclaration ? 'get' : 'set'}() ${declaration.name}` +
            `${declaration.type ? `: ${declaration.type}` : ''}`;
    }
    return declaration.name;
}
class DeclarationStructureTreeItem extends BaseStructureTreeItem_1.BaseStructureTreeItem {
    constructor(declaration, context) {
        super(getDeclarationLabel(declaration));
        this.declaration = declaration;
        this.context = context;
        if (declaration instanceof typescript_parser_1.ClassDeclaration ||
            declaration instanceof typescript_parser_1.InterfaceDeclaration) {
            this.collapsibleState = vscode_1.TreeItemCollapsibleState.Collapsed;
        }
        else {
            this.command = this.command = this.createJumpToCommand([declaration]);
        }
    }
    get iconPath() {
        switch (utilityFunctions_1.getItemKind(this.declaration)) {
            case vscode_1.CompletionItemKind.Class:
            case vscode_1.CompletionItemKind.Keyword:
                return this.context.asAbsolutePath(fileTemplate('class'));
            case vscode_1.CompletionItemKind.Interface:
                return this.context.asAbsolutePath(fileTemplate('interface'));
            case vscode_1.CompletionItemKind.Enum:
                return this.context.asAbsolutePath(fileTemplate('enum'));
            case vscode_1.CompletionItemKind.Function:
            case vscode_1.CompletionItemKind.Method:
                return this.context.asAbsolutePath(fileTemplate('callable'));
            case vscode_1.CompletionItemKind.Module:
                return this.context.asAbsolutePath(fileTemplate('module'));
            case vscode_1.CompletionItemKind.Property:
                return this.context.asAbsolutePath(fileTemplate('property'));
            default:
                break;
        }
        if (utilityFunctions_1.getItemKind(this.declaration) === vscode_1.CompletionItemKind.Variable) {
            return this.declaration.isConst ?
                this.context.asAbsolutePath(fileTemplate('const')) :
                this.context.asAbsolutePath(fileTemplate('variable'));
        }
        return this.context.asAbsolutePath(fileTemplate('default'));
    }
    getChildren() {
        if (this.declaration instanceof typescript_parser_1.ClassDeclaration ||
            this.declaration instanceof typescript_parser_1.InterfaceDeclaration) {
            return [
                ...this.declaration.accessors.map(p => new DeclarationStructureTreeItem(p, this.context)),
                ...this.declaration.properties.map(p => new DeclarationStructureTreeItem(p, this.context)),
                ...this.declaration.methods.map(m => new DeclarationStructureTreeItem(m, this.context)),
            ];
        }
        return [];
    }
}
exports.DeclarationStructureTreeItem = DeclarationStructureTreeItem;
