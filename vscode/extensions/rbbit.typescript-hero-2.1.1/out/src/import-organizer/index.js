"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const typescript_parser_1 = require("typescript-parser");
const vscode_1 = require("vscode");
const configuration_1 = require("../configuration");
const declaration_manager_1 = require("../declarations/declaration-manager");
const ioc_symbols_1 = require("../ioc-symbols");
const utility_functions_1 = require("../utilities/utility-functions");
const import_quick_pick_item_1 = require("./import-quick-pick-item");
let ImportOrganizer = class ImportOrganizer {
    constructor(context, logger, config, importManagerProvider, declarationManager, parser) {
        this.context = context;
        this.logger = logger;
        this.config = config;
        this.importManagerProvider = importManagerProvider;
        this.declarationManager = declarationManager;
        this.parser = parser;
    }
    setup() {
        this.logger.debug('Setting up ImportOrganizer.');
        this.context.subscriptions.push(vscode_1.commands.registerTextEditorCommand('typescriptHero.imports.organize', () => this.organizeImports()));
        this.context.subscriptions.push(vscode_1.commands.registerTextEditorCommand('typescriptHero.index.addImport', () => this.addImport()));
        this.context.subscriptions.push(vscode_1.commands.registerTextEditorCommand('typescriptHero.index.addImportUnderCursor', () => this.addImportUnderCursor()));
        this.context.subscriptions.push(vscode_1.workspace.onWillSaveTextDocument((event) => {
            if (!this.config.imports.organizeOnSave(event.document.uri)) {
                this.logger.debug('OrganizeOnSave is deactivated through config');
                return;
            }
            if (this.config.parseableLanguages().indexOf(event.document.languageId) < 0) {
                this.logger.debug('OrganizeOnSave not possible for given language', { language: event.document.languageId });
                return;
            }
            this.logger.info('OrganizeOnSave for file', { file: event.document.fileName });
            event.waitUntil(this.importManagerProvider(event.document).then(manager => manager.organizeImports().calculateTextEdits()));
        }));
    }
    start() {
        this.logger.info('Starting up ImportOrganizer.');
    }
    stop() {
        this.logger.info('Stopping ImportOrganizer.');
    }
    dispose() {
        this.logger.debug('Disposing ImportOrganizer.');
    }
    organizeImports() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!vscode_1.window.activeTextEditor) {
                return;
            }
            try {
                this.logger.debug('Organize the imports in the document', { file: vscode_1.window.activeTextEditor.document.fileName });
                const ctrl = yield this.importManagerProvider(vscode_1.window.activeTextEditor.document);
                yield ctrl.organizeImports().commit();
            }
            catch (e) {
                this.logger.error('Imports could not be organized, error: %s', e, { file: vscode_1.window.activeTextEditor.document.fileName });
            }
        });
    }
    addImport() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!vscode_1.window.activeTextEditor) {
                return;
            }
            const index = this.declarationManager.getIndexForFile(vscode_1.window.activeTextEditor.document.uri);
            if (!index || !index.indexReady) {
                this.showCacheWarning();
                return;
            }
            try {
                const selectedItem = yield vscode_1.window.showQuickPick(index.declarationInfos.map(o => new import_quick_pick_item_1.default(o)), { placeHolder: 'Add import to document:' });
                if (selectedItem) {
                    this.logger.info('Add import to document', { specifier: selectedItem.declarationInfo.declaration.name, library: selectedItem.declarationInfo.from });
                    this.addImportToDocument(selectedItem.declarationInfo);
                }
            }
            catch (e) {
                this.logger.error('Import could not be added to document', { file: vscode_1.window.activeTextEditor.document.fileName, error: e.toString() });
                vscode_1.window.showErrorMessage('The import cannot be completed, there was an error during the process.');
            }
        });
    }
    addImportUnderCursor() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!vscode_1.window.activeTextEditor) {
                return;
            }
            const index = this.declarationManager.getIndexForFile(vscode_1.window.activeTextEditor.document.uri);
            if (!index || !index.indexReady) {
                this.showCacheWarning();
                return;
            }
            try {
                const selectedSymbol = this.getSymbolUnderCursor();
                this.logger.debug('Add import for symbol under cursor', { selectedSymbol });
                if (!!!selectedSymbol) {
                    return;
                }
                const resolveItems = yield this.getDeclarationsForImport({
                    cursorSymbol: selectedSymbol,
                    documentSource: vscode_1.window.activeTextEditor.document.getText(),
                    documentPath: vscode_1.window.activeTextEditor.document.fileName,
                });
                if (resolveItems.length < 1) {
                    this.logger.info('The symbol was not found or is already imported', { selectedSymbol });
                    vscode_1.window.showInformationMessage(`The symbol '${selectedSymbol}' was not found in the index or is already imported.`);
                }
                else if (resolveItems.length === 1 && resolveItems[0].declaration.name === selectedSymbol) {
                    this.logger.info('Add import to document', {
                        specifier: resolveItems[0].declaration.name,
                        library: resolveItems[0].from,
                    });
                    this.addImportToDocument(resolveItems[0]);
                }
                else {
                    const selectedItem = yield vscode_1.window.showQuickPick(resolveItems.map(o => new import_quick_pick_item_1.default(o)), { placeHolder: 'Multiple declarations found:' });
                    if (selectedItem) {
                        this.logger.info('Add import to document', {
                            specifier: selectedItem.declarationInfo.declaration.name,
                            library: selectedItem.declarationInfo.from,
                        });
                        this.addImportToDocument(selectedItem.declarationInfo);
                    }
                }
            }
            catch (e) {
                this.logger.error('Import could not be added to document.', { file: vscode_1.window.activeTextEditor.document.fileName, error: e.toString() });
                vscode_1.window.showErrorMessage('The import cannot be completed, there was an error during the process.');
            }
        });
    }
    getDeclarationsForImport({ cursorSymbol, documentSource, documentPath }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!vscode_1.window.activeTextEditor) {
                return [];
            }
            const index = this.declarationManager.getIndexForFile(vscode_1.window.activeTextEditor.document.uri);
            const rootFolder = vscode_1.workspace.getWorkspaceFolder(vscode_1.window.activeTextEditor.document.uri);
            if (!index || !index.indexReady || !rootFolder) {
                return [];
            }
            this.logger.debug('Calculate possible imports for document', { cursorSymbol, file: documentPath });
            const parsedSource = yield this.parser.parseSource(documentSource, utility_functions_1.getScriptKind(documentPath));
            const activeDocumentDeclarations = parsedSource.declarations.map(o => o.name);
            const declarations = utility_functions_1.getDeclarationsFilteredByImports(index.declarationInfos, documentPath, parsedSource.imports, rootFolder.uri.fsPath).filter(o => o.declaration.name.startsWith(cursorSymbol));
            return [
                ...declarations.filter(o => o.from.startsWith('/')),
                ...declarations.filter(o => !o.from.startsWith('/')),
            ].filter(o => activeDocumentDeclarations.indexOf(o.declaration.name) === -1);
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
    addImportToDocument(declaration) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!vscode_1.window.activeTextEditor) {
                return false;
            }
            const ctrl = yield this.importManagerProvider(vscode_1.window.activeTextEditor.document);
            return ctrl.addDeclarationImport(declaration).commit();
        });
    }
    showCacheWarning() {
        this.logger.warn('index was not ready or not index for this file found');
        vscode_1.window.showWarningMessage('Please wait a few seconds longer until the symbol cache has been build.');
    }
};
ImportOrganizer = tslib_1.__decorate([
    inversify_1.injectable(),
    tslib_1.__param(0, inversify_1.inject(ioc_symbols_1.default.extensionContext)),
    tslib_1.__param(1, inversify_1.inject(ioc_symbols_1.default.logger)),
    tslib_1.__param(2, inversify_1.inject(ioc_symbols_1.default.configuration)),
    tslib_1.__param(3, inversify_1.inject(ioc_symbols_1.default.importManager)),
    tslib_1.__param(4, inversify_1.inject(ioc_symbols_1.default.declarationManager)),
    tslib_1.__param(5, inversify_1.inject(ioc_symbols_1.default.parser)),
    tslib_1.__metadata("design:paramtypes", [Object, Object, configuration_1.default, Function, declaration_manager_1.default,
        typescript_parser_1.TypescriptParser])
], ImportOrganizer);
exports.default = ImportOrganizer;
