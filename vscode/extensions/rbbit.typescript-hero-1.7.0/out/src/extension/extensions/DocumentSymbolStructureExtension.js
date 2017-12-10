"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const typescript_parser_1 = require("typescript-parser");
const vscode_1 = require("vscode");
const IoCSymbols_1 = require("../IoCSymbols");
const DeclarationStructureTreeItem_1 = require("../provider-items/document-structure/DeclarationStructureTreeItem");
const DisabledStructureTreeItem_1 = require("../provider-items/document-structure/DisabledStructureTreeItem");
const ImportsStructureTreeItem_1 = require("../provider-items/document-structure/ImportsStructureTreeItem");
const NotParseableStructureTreeItem_1 = require("../provider-items/document-structure/NotParseableStructureTreeItem");
const ResourceStructureTreeItem_1 = require("../provider-items/document-structure/ResourceStructureTreeItem");
const BaseExtension_1 = require("./BaseExtension");
let DocumentSymbolStructureExtension = DocumentSymbolStructureExtension_1 = class DocumentSymbolStructureExtension extends BaseExtension_1.BaseExtension {
    constructor(context, logger, config, parser) {
        super(context);
        this.logger = logger;
        this.config = config;
        this.parser = parser;
        this._onDidChangeTreeData = new vscode_1.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    initialize() {
        this.context.subscriptions.push(vscode_1.window.registerTreeDataProvider('documentCodeOutline', this));
        this.context.subscriptions.push(vscode_1.commands.registerCommand('typescriptHero.documentCodeOutline.gotoNode', (node) => this.jumpToNode(node)));
        this.context.subscriptions.push(this._onDidChangeTreeData);
        this.context.subscriptions.push(vscode_1.window.onDidChangeActiveTextEditor(() => this.activeWindowChanged()));
        this.context.subscriptions.push(vscode_1.workspace.onDidSaveTextDocument(() => this.activeWindowChanged()));
        this.logger.info('[%s] initialized', DocumentSymbolStructureExtension_1.name);
    }
    dispose() {
        this.logger.info('[%s] disposed', DocumentSymbolStructureExtension_1.name);
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!vscode_1.window.activeTextEditor) {
                return [];
            }
            const config = this.config(vscode_1.window.activeTextEditor.document.uri);
            if (!config.codeOutline.outlineEnabled) {
                return [new DisabledStructureTreeItem_1.DisabledStructureTreeItem()];
            }
            if (!config.resolver.resolverModeLanguages.some(lang => lang === vscode_1.window.activeTextEditor.document.languageId)) {
                return [new NotParseableStructureTreeItem_1.NotParseableStructureTreeItem()];
            }
            if (!this.documentCache) {
                try {
                    this.documentCache = yield this.parser.parseSource(vscode_1.window.activeTextEditor.document.getText());
                }
                catch (e) {
                    this.logger.error('[%s] document could not be parsed, error: %s', DocumentSymbolStructureExtension_1.name, e);
                    return [];
                }
            }
            if (!element) {
                const items = [];
                if (this.documentCache.imports && this.documentCache.imports.length) {
                    items.push(new ImportsStructureTreeItem_1.ImportsStructureTreeItem(this.documentCache, this.context));
                }
                items.push(...this.documentCache.resources.map(r => new ResourceStructureTreeItem_1.ResourceStructureTreeItem(r, this.context)));
                items.push(...this.documentCache.declarations.map(d => new DeclarationStructureTreeItem_1.DeclarationStructureTreeItem(d, this.context)));
                return items;
            }
            return element.getChildren();
        });
    }
    jumpToNode(node) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!node) {
                this.logger.warn('[%s] jumpToNode used without param', DocumentSymbolStructureExtension_1.name);
                vscode_1.window.showWarningMessage('This command is for internal use only. It cannot be used from Cmd+P');
                return;
            }
            if (!vscode_1.window.activeTextEditor || node.start === undefined) {
                return;
            }
            const newPosition = vscode_1.window.activeTextEditor.document.positionAt(node.start);
            vscode_1.window.activeTextEditor.selection = new vscode_1.Selection(newPosition, newPosition);
            vscode_1.window.activeTextEditor.revealRange(vscode_1.window.activeTextEditor.selection, vscode_1.TextEditorRevealType.InCenter);
            yield vscode_1.window.showTextDocument(vscode_1.window.activeTextEditor.document);
        });
    }
    activeWindowChanged() {
        this.logger.debug('[%s] activeWindowChanged, reparsing', DocumentSymbolStructureExtension_1.name);
        this.documentCache = undefined;
        this._onDidChangeTreeData.fire();
    }
};
DocumentSymbolStructureExtension = DocumentSymbolStructureExtension_1 = tslib_1.__decorate([
    inversify_1.injectable(),
    tslib_1.__param(0, inversify_1.inject(IoCSymbols_1.iocSymbols.extensionContext)),
    tslib_1.__param(1, inversify_1.inject(IoCSymbols_1.iocSymbols.logger)),
    tslib_1.__param(2, inversify_1.inject(IoCSymbols_1.iocSymbols.configuration)),
    tslib_1.__param(3, inversify_1.inject(IoCSymbols_1.iocSymbols.typescriptParser)),
    tslib_1.__metadata("design:paramtypes", [Object, Object, Function, typescript_parser_1.TypescriptParser])
], DocumentSymbolStructureExtension);
exports.DocumentSymbolStructureExtension = DocumentSymbolStructureExtension;
var DocumentSymbolStructureExtension_1;
