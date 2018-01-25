"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const typescript_parser_1 = require("typescript-parser");
const vscode_1 = require("vscode");
const configuration_1 = require("../configuration");
const ioc_symbols_1 = require("../ioc-symbols");
const utility_functions_1 = require("../utilities/utility-functions");
const declaration_structure_tree_item_1 = require("./declaration-structure-tree-item");
const disabled_structure_tree_item_1 = require("./disabled-structure-tree-item");
const imports_structure_tree_item_1 = require("./imports-structure-tree-item");
const not_parseable_structure_tree_item_1 = require("./not-parseable-structure-tree-item");
const resource_structure_tree_item_1 = require("./resource-structure-tree-item");
let CodeOutline = class CodeOutline {
    constructor(context, logger, config, parser) {
        this.context = context;
        this.logger = logger;
        this.config = config;
        this.parser = parser;
        this.disposables = [];
    }
    get onDidChangeTreeData() {
        return this._onDidChangeTreeData.event;
    }
    setup() {
        this.logger.debug('Setting up CodeOutline.');
        this.subscription = this.config.configurationChanged.subscribe(() => {
            if (this.config.codeOutline.isEnabled() && !this.disposables) {
                this.start();
            }
            else if (!this.config.codeOutline.isEnabled() && this.disposables) {
                this.stop();
            }
        });
        this.context.subscriptions.push(vscode_1.commands.registerCommand('typescriptHero.codeOutline.gotoNode', (node) => this.jumpToNode(node)));
    }
    start() {
        if (!this.config.codeOutline.isEnabled()) {
            this.logger.info(`Not starting CodeOutline. It's disabled by config.`);
            return;
        }
        this.logger.info('Starting up CodeOutline.');
        this._onDidChangeTreeData = new vscode_1.EventEmitter();
        this.disposables.push(vscode_1.window.registerTreeDataProvider('codeOutline', this));
        this.disposables.push(this._onDidChangeTreeData);
        this.disposables.push(vscode_1.window.onDidChangeActiveTextEditor(() => this.activeWindowChanged()));
        this.disposables.push(vscode_1.workspace.onDidSaveTextDocument(() => this.activeWindowChanged()));
    }
    stop() {
        if (this.config.codeOutline.isEnabled()) {
            this.logger.info(`Not stopping CodeOutline. It's enabled by config.`);
            return;
        }
        this.logger.info('Stopping CodeOutline.');
        for (const disposable of this.disposables) {
            disposable.dispose();
        }
        this.disposables = [];
    }
    dispose() {
        this.logger.debug('Disposing CodeOutline.');
        if (this.subscription) {
            this.subscription.unsubscribe();
            delete this.subscription;
        }
        for (const disposable of this.disposables) {
            disposable.dispose();
        }
        this.disposables = [];
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!vscode_1.window.activeTextEditor) {
                return [];
            }
            if (!this.config.codeOutline.isEnabled()) {
                return [new disabled_structure_tree_item_1.default()];
            }
            if (!this.config.parseableLanguages().some(lang => lang === vscode_1.window.activeTextEditor.document.languageId)) {
                return [new not_parseable_structure_tree_item_1.default()];
            }
            if (!this.documentCache) {
                try {
                    this.documentCache = yield this.parser.parseSource(vscode_1.window.activeTextEditor.document.getText(), utility_functions_1.getScriptKind(vscode_1.window.activeTextEditor.document.fileName));
                }
                catch (e) {
                    this.logger.error(`[CodeOutline] document could not be parsed, error: ${e}`);
                    return [];
                }
            }
            if (!element) {
                const items = [];
                if (this.documentCache.imports && this.documentCache.imports.length) {
                    items.push(new imports_structure_tree_item_1.ImportsStructureTreeItem(this.documentCache, this.context));
                }
                items.push(...this.documentCache.resources.map(r => new resource_structure_tree_item_1.default(r, this.context)));
                items.push(...this.documentCache.declarations.map(d => new declaration_structure_tree_item_1.default(d, this.context)));
                return items;
            }
            return element.getChildren();
        });
    }
    activeWindowChanged() {
        this.logger.debug('[CodeOutline] activeWindowChanged, reparsing');
        this.documentCache = undefined;
        this._onDidChangeTreeData.fire();
    }
    jumpToNode(node) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!node) {
                this.logger.warn('[CodeOutline] jumpToNode used without param');
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
};
CodeOutline = tslib_1.__decorate([
    inversify_1.injectable(),
    tslib_1.__param(0, inversify_1.inject(ioc_symbols_1.default.extensionContext)),
    tslib_1.__param(1, inversify_1.inject(ioc_symbols_1.default.logger)),
    tslib_1.__param(2, inversify_1.inject(ioc_symbols_1.default.configuration)),
    tslib_1.__param(3, inversify_1.inject(ioc_symbols_1.default.parser)),
    tslib_1.__metadata("design:paramtypes", [Object, Object, configuration_1.default,
        typescript_parser_1.TypescriptParser])
], CodeOutline);
exports.default = CodeOutline;
