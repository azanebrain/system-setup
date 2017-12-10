"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const typescript_parser_1 = require("typescript-parser");
const vscode_1 = require("vscode");
const helpers_1 = require("../../common/helpers");
const quick_pick_items_1 = require("../../common/quick-pick-items");
const IoCSymbols_1 = require("../IoCSymbols");
const managers_1 = require("../managers");
const DeclarationIndexMapper_1 = require("../utilities/DeclarationIndexMapper");
const BaseExtension_1 = require("./BaseExtension");
const resolverOk = 'TSH Resolver $(check)';
const resolverSyncing = 'TSH Resolver $(sync)';
const resolverErr = 'TSH Resolver $(flame)';
let ImportResolveExtension = ImportResolveExtension_1 = class ImportResolveExtension extends BaseExtension_1.BaseExtension {
    constructor(context, logger, parser, indices) {
        super(context);
        this.logger = logger;
        this.parser = parser;
        this.indices = indices;
        this.statusBarItem = vscode_1.window.createStatusBarItem(vscode_1.StatusBarAlignment.Left, 4);
    }
    initialize() {
        this.context.subscriptions.push(this.statusBarItem);
        this.statusBarItem.text = resolverOk;
        this.statusBarItem.tooltip = 'Click to manually reindex all files';
        this.statusBarItem.command = 'typescriptHero.resolve.rebuildCache';
        this.context.subscriptions.push(this.indices.onStartIndexing(() => {
            this.statusBarItem.text = resolverSyncing;
        }));
        this.context.subscriptions.push(this.indices.onFinishIndexing(() => {
            this.statusBarItem.text = resolverOk;
        }));
        this.context.subscriptions.push(this.indices.onIndexingError(() => {
            this.statusBarItem.text = resolverErr;
        }));
        this.statusBarItem.show();
        this.commandRegistrations();
        this.logger.info('[%s] initialized', ImportResolveExtension_1.name);
    }
    dispose() {
        this.logger.info('[%s] disposed', ImportResolveExtension_1.name);
    }
    addImport() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!vscode_1.window.activeTextEditor) {
                return;
            }
            const index = this.indices.getIndexForFile(vscode_1.window.activeTextEditor.document.uri);
            if (!index || !index.indexReady) {
                this.showCacheWarning();
                return;
            }
            try {
                const selectedItem = yield vscode_1.window.showQuickPick(index.declarationInfos.map(o => new quick_pick_items_1.ResolveQuickPickItem(o)), { placeHolder: 'Add import to document:' });
                if (selectedItem) {
                    this.logger.info('[%s] add import to document', ImportResolveExtension_1.name, { specifier: selectedItem.declarationInfo.declaration.name, library: selectedItem.declarationInfo.from });
                    this.addImportToDocument(selectedItem.declarationInfo);
                }
            }
            catch (e) {
                this.logger.error('[%s] import could not be added to document, error: %s', ImportResolveExtension_1.name, e, { file: vscode_1.window.activeTextEditor.document.fileName });
                vscode_1.window.showErrorMessage('The import cannot be completed, there was an error during the process.');
            }
        });
    }
    addImportUnderCursor() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!vscode_1.window.activeTextEditor) {
                return;
            }
            const index = this.indices.getIndexForFile(vscode_1.window.activeTextEditor.document.uri);
            if (!index || !index.indexReady) {
                this.showCacheWarning();
                return;
            }
            try {
                const selectedSymbol = this.getSymbolUnderCursor();
                this.logger.debug('[%s] add import for symbol under cursor', ImportResolveExtension_1.name, { selectedSymbol });
                if (!!!selectedSymbol) {
                    return;
                }
                const resolveItems = yield this.getDeclarationsForImport({
                    cursorSymbol: selectedSymbol,
                    documentSource: vscode_1.window.activeTextEditor.document.getText(),
                    documentPath: vscode_1.window.activeTextEditor.document.fileName,
                });
                if (resolveItems.length < 1) {
                    this.logger.info('[%s] the symbol was not found or is already imported', ImportResolveExtension_1.name, { selectedSymbol });
                    vscode_1.window.showInformationMessage(`The symbol '${selectedSymbol}' was not found in the index or is already imported.`);
                }
                else if (resolveItems.length === 1 && resolveItems[0].declaration.name === selectedSymbol) {
                    this.logger.info('[%s] add import to document', ImportResolveExtension_1.name, {
                        specifier: resolveItems[0].declaration.name,
                        library: resolveItems[0].from,
                    });
                    this.addImportToDocument(resolveItems[0]);
                }
                else {
                    const selectedItem = yield vscode_1.window.showQuickPick(resolveItems.map(o => new quick_pick_items_1.ResolveQuickPickItem(o)), { placeHolder: 'Multiple declarations found:' });
                    if (selectedItem) {
                        this.logger.info('[%s] add import to document', ImportResolveExtension_1.name, {
                            specifier: selectedItem.declarationInfo.declaration.name,
                            library: selectedItem.declarationInfo.from,
                        });
                        this.addImportToDocument(selectedItem.declarationInfo);
                    }
                }
            }
            catch (e) {
                this.logger.error('[%s] import could not be added to document, error: %s', ImportResolveExtension_1.name, e, { file: vscode_1.window.activeTextEditor.document.fileName });
                vscode_1.window.showErrorMessage('The import cannot be completed, there was an error during the process.');
            }
        });
    }
    addMissingImports() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!vscode_1.window.activeTextEditor) {
                return;
            }
            const index = this.indices.getIndexForFile(vscode_1.window.activeTextEditor.document.uri);
            if (!index || !index.indexReady) {
                this.showCacheWarning();
                return;
            }
            try {
                this.logger.debug('[%s] add all missing imports to the document', ImportResolveExtension_1.name, { file: vscode_1.window.activeTextEditor.document.fileName });
                const missing = yield this.getMissingDeclarationsForFile({
                    documentSource: vscode_1.window.activeTextEditor.document.getText(),
                    documentPath: vscode_1.window.activeTextEditor.document.fileName,
                });
                if (missing && missing.length) {
                    const ctrl = yield managers_1.ImportManager.create(vscode_1.window.activeTextEditor.document);
                    missing.filter(o => o instanceof typescript_parser_1.DeclarationInfo).forEach(o => ctrl.addDeclarationImport(o));
                    yield ctrl.commit();
                }
            }
            catch (e) {
                this.logger.error('[%s] missing imports could not be added, error: %s', ImportResolveExtension_1.name, e, { file: vscode_1.window.activeTextEditor.document.fileName });
                vscode_1.window.showErrorMessage('The operation cannot be completed, there was an error during the process.');
            }
        });
    }
    organizeImports() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!vscode_1.window.activeTextEditor) {
                return false;
            }
            try {
                this.logger.debug('[%s] organize the imports in the document', ImportResolveExtension_1.name, { file: vscode_1.window.activeTextEditor.document.fileName });
                const ctrl = yield managers_1.ImportManager.create(vscode_1.window.activeTextEditor.document);
                return yield ctrl.organizeImports().commit();
            }
            catch (e) {
                this.logger.error('[%s] imports could not be organized, error: %s', ImportResolveExtension_1.name, e, { file: vscode_1.window.activeTextEditor.document.fileName });
                return false;
            }
        });
    }
    addImportToDocument(declaration) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!vscode_1.window.activeTextEditor) {
                return false;
            }
            const ctrl = yield managers_1.ImportManager.create(vscode_1.window.activeTextEditor.document);
            return yield ctrl.addDeclarationImport(declaration).commit();
        });
    }
    getSymbolUnderCursor() {
        const editor = vscode_1.window.activeTextEditor;
        if (!editor) {
            return '';
        }
        const selection = editor.selection;
        const word = editor.document.getWordRangeAtPosition(selection.active);
        return word && !word.isEmpty ? editor.document.getText(word) : '';
    }
    showCacheWarning() {
        this.logger.warn('[%s] index was not ready or not index for this file found', ImportResolveExtension_1.name);
        vscode_1.window.showWarningMessage('Please wait a few seconds longer until the symbol cache has been build.');
    }
    getDeclarationsForImport({ cursorSymbol, documentSource, documentPath }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!vscode_1.window.activeTextEditor) {
                return [];
            }
            const index = this.indices.getIndexForFile(vscode_1.window.activeTextEditor.document.uri);
            const rootFolder = vscode_1.workspace.getWorkspaceFolder(vscode_1.window.activeTextEditor.document.uri);
            if (!index || !index.indexReady || !rootFolder) {
                return [];
            }
            this.logger.debug('[%s] calculate possible imports for document', ImportResolveExtension_1.name, { cursorSymbol, file: documentPath });
            const parsedSource = yield this.parser.parseSource(documentSource);
            const activeDocumentDeclarations = parsedSource.declarations.map(o => o.name);
            const declarations = helpers_1.getDeclarationsFilteredByImports(index.declarationInfos, documentPath, parsedSource.imports, rootFolder.uri.fsPath).filter(o => o.declaration.name.startsWith(cursorSymbol));
            return [
                ...declarations.filter(o => o.from.startsWith('/')),
                ...declarations.filter(o => !o.from.startsWith('/')),
            ].filter(o => activeDocumentDeclarations.indexOf(o.declaration.name) === -1);
        });
    }
    getMissingDeclarationsForFile({ documentSource, documentPath }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!vscode_1.window.activeTextEditor) {
                return [];
            }
            const index = this.indices.getIndexForFile(vscode_1.window.activeTextEditor.document.uri);
            const rootFolder = vscode_1.workspace.getWorkspaceFolder(vscode_1.window.activeTextEditor.document.uri);
            if (!index || !index.indexReady || !rootFolder) {
                return [];
            }
            this.logger.debug('[%s] calculate missing imports for document', ImportResolveExtension_1.name, { file: documentPath });
            const parsedDocument = yield this.parser.parseSource(documentSource);
            const missingDeclarations = [];
            const declarations = helpers_1.getDeclarationsFilteredByImports(index.declarationInfos, documentPath, parsedDocument.imports, rootFolder.uri.fsPath);
            for (const usage of parsedDocument.nonLocalUsages) {
                const foundDeclarations = declarations.filter(o => o.declaration.name === usage);
                if (foundDeclarations.length <= 0) {
                    continue;
                }
                else if (foundDeclarations.length === 1) {
                    missingDeclarations.push(foundDeclarations[0]);
                }
                else {
                }
            }
            return missingDeclarations;
        });
    }
    commandRegistrations() {
        this.context.subscriptions.push(vscode_1.commands.registerTextEditorCommand('typescriptHero.resolve.addImport', () => this.addImport()));
        this.context.subscriptions.push(vscode_1.commands.registerTextEditorCommand('typescriptHero.resolve.addImportUnderCursor', () => this.addImportUnderCursor()));
        this.context.subscriptions.push(vscode_1.commands.registerTextEditorCommand('typescriptHero.resolve.addMissingImports', () => this.addMissingImports()));
        this.context.subscriptions.push(vscode_1.commands.registerTextEditorCommand('typescriptHero.resolve.organizeImports', () => this.organizeImports()));
        this.context.subscriptions.push(vscode_1.commands.registerCommand('typescriptHero.resolve.rebuildCache', () => this.indices.rebuildAll()));
    }
};
ImportResolveExtension = ImportResolveExtension_1 = tslib_1.__decorate([
    inversify_1.injectable(),
    tslib_1.__param(0, inversify_1.inject(IoCSymbols_1.iocSymbols.extensionContext)),
    tslib_1.__param(1, inversify_1.inject(IoCSymbols_1.iocSymbols.logger)),
    tslib_1.__param(2, inversify_1.inject(IoCSymbols_1.iocSymbols.typescriptParser)),
    tslib_1.__param(3, inversify_1.inject(IoCSymbols_1.iocSymbols.declarationIndexMapper)),
    tslib_1.__metadata("design:paramtypes", [Object, Object, typescript_parser_1.TypescriptParser,
        DeclarationIndexMapper_1.DeclarationIndexMapper])
], ImportResolveExtension);
exports.ImportResolveExtension = ImportResolveExtension;
var ImportResolveExtension_1;
