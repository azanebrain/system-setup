"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs_1 = require("fs");
const inversify_1 = require("inversify");
const path_1 = require("path");
const typescript_parser_1 = require("typescript-parser");
const vscode_1 = require("vscode");
const enums_1 = require("../../common/enums");
const helpers_1 = require("../../common/helpers");
const quick_pick_items_1 = require("../../common/quick-pick-items");
const IoCSymbols_1 = require("../IoCSymbols");
const managers_1 = require("../managers");
const BaseExtension_1 = require("./BaseExtension");
function compareIgnorePatterns(local, config) {
    if (local.length !== config.length) {
        return false;
    }
    const localSorted = local.sort();
    const configSorted = config.sort();
    for (let x = 0; x < configSorted.length; x += 1) {
        if (configSorted[x] !== localSorted[x]) {
            return false;
        }
    }
    return true;
}
function findFiles(config, rootPath) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const searches = [
            vscode_1.workspace.findFiles(`{${config.resolver.resolverModeFileGlobs.join(',')}}`, '{**/node_modules/**,**/typings/**}'),
        ];
        let globs = [];
        let ignores = ['**/typings/**'];
        const excludePatterns = config.resolver.ignorePatterns;
        if (rootPath && fs_1.existsSync(path_1.join(rootPath, 'package.json'))) {
            const packageJson = require(path_1.join(rootPath, 'package.json'));
            if (packageJson['dependencies']) {
                globs = globs.concat(Object.keys(packageJson['dependencies']).filter(o => excludePatterns.indexOf(o) < 0)
                    .map(o => `**/node_modules/${o}/**/*.d.ts`));
                ignores = ignores.concat(Object.keys(packageJson['dependencies']).filter(o => excludePatterns.indexOf(o) < 0)
                    .map(o => `**/node_modules/${o}/node_modules/**`));
            }
            if (packageJson['devDependencies']) {
                globs = globs.concat(Object.keys(packageJson['devDependencies']).filter(o => excludePatterns.indexOf(o) < 0)
                    .map(o => `**/node_modules/${o}/**/*.d.ts`));
                ignores = ignores.concat(Object.keys(packageJson['devDependencies']).filter(o => excludePatterns.indexOf(o) < 0)
                    .map(o => `**/node_modules/${o}/node_modules/**`));
            }
        }
        else {
            globs.push('**/node_modules/**/*.d.ts');
        }
        searches.push(vscode_1.workspace.findFiles(`{${globs.join(',')}}`, `{${ignores.join(',')}}`));
        searches.push(vscode_1.workspace.findFiles('**/typings/**/*.d.ts', '**/node_modules/**'));
        let uris = yield Promise.all(searches);
        uris = uris.map((o, idx) => idx === 0 ?
            o.filter(f => f.fsPath
                .replace(rootPath || '', '')
                .split(/\\|\//)
                .every(p => excludePatterns.indexOf(p) < 0)) :
            o);
        return uris.reduce((all, cur) => all.concat(cur), []).map(o => o.fsPath);
    });
}
exports.findFiles = findFiles;
const resolverOk = 'TSH Resolver $(check)';
const resolverSyncing = 'TSH Resolver $(sync)';
const resolverErr = 'TSH Resolver $(flame)';
let ImportResolveExtension = class ImportResolveExtension extends BaseExtension_1.BaseExtension {
    constructor(context, loggerFactory, config, parser, index, rootPath) {
        super(context);
        this.config = config;
        this.parser = parser;
        this.index = index;
        this.rootPath = rootPath;
        this.statusBarItem = vscode_1.window.createStatusBarItem(vscode_1.StatusBarAlignment.Left, 4);
        this.logger = loggerFactory('ImportResolveExtension');
    }
    initialize() {
        this.actualMode = this.config.resolver.resolverMode;
        this.ignorePatterns = this.config.resolver.ignorePatterns;
        this.fileWatcher = vscode_1.workspace.createFileSystemWatcher(`{${this.config.resolver.resolverModeFileGlobs.join(',')},**/package.json,**/typings.json}`);
        this.context.subscriptions.push(this.statusBarItem);
        this.context.subscriptions.push(this.fileWatcher);
        this.statusBarItem.text = resolverOk;
        this.statusBarItem.tooltip =
            `Click to manually reindex all files; Actual mode: ${enums_1.ResolverMode[this.config.resolver.resolverMode]}`;
        this.statusBarItem.command = 'typescriptHero.resolve.rebuildCache';
        this.statusBarItem.show();
        this.commandRegistrations();
        this.context.subscriptions.push(vscode_1.workspace.onDidChangeConfiguration(() => {
            let build = false;
            if (!compareIgnorePatterns(this.ignorePatterns, this.config.resolver.ignorePatterns)) {
                this.logger.info('The typescriptHero.resolver.ignorePatterns setting was modified, reload the index.');
                this.ignorePatterns = this.config.resolver.ignorePatterns;
                build = true;
            }
            if (this.actualMode !== this.config.resolver.resolverMode) {
                this.logger.info('The typescriptHero.resolver.resolverMode setting was modified, reload the index.');
                this.statusBarItem.tooltip =
                    `Click to manually reindex all files; Actual mode: ${enums_1.ResolverMode[this.config.resolver.resolverMode]}`;
                this.actualMode = this.config.resolver.resolverMode;
                build = true;
            }
            if (build) {
                this.buildIndex();
            }
        }));
        let timeout;
        let events;
        const fileWatcherEvent = (event, uri) => {
            if (timeout) {
                clearTimeout(timeout);
            }
            if (!events) {
                events = {
                    created: [],
                    updated: [],
                    deleted: [],
                };
            }
            events[event].push(uri.fsPath);
            timeout = setTimeout(() => {
                if (events) {
                    this.rebuildForFileChanges(events);
                    events = undefined;
                }
            }, 500);
        };
        this.fileWatcher.onDidCreate(uri => fileWatcherEvent('created', uri));
        this.fileWatcher.onDidChange(uri => fileWatcherEvent('updated', uri));
        this.fileWatcher.onDidDelete(uri => fileWatcherEvent('deleted', uri));
        this.buildIndex();
        this.logger.info('Initialized');
    }
    dispose() {
        this.logger.info('Disposed');
    }
    buildIndex() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.abstractIndexFunction('Create index.', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const files = yield findFiles(this.config, this.rootPath);
                this.logger.info(`Calculating index for ${files.length} files.`);
                yield this.index.buildIndex(files);
            }));
        });
    }
    rebuildForFileChanges(changes) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.abstractIndexFunction('Reindex changes.', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield this.index.reindexForChanges(changes);
            }));
        });
    }
    abstractIndexFunction(title, func) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield vscode_1.window.withProgress({
                title,
                location: vscode_1.ProgressLocation.Window,
            }, (progress) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.logger.info('(Re-)Calculating index.');
                progress.report({ message: '(Re-)Calculating index.' });
                this.statusBarItem.text = resolverSyncing;
                try {
                    yield func();
                    this.logger.info('(Re-)Calculate finished.');
                    progress.report({ message: '(Re-)Calculate finished.' });
                    this.statusBarItem.text = resolverOk;
                }
                catch (e) {
                    this.logger.error('There was an error during the index (re)calculation.', e);
                    progress.report({ message: 'There was an error during the index (re)calculation.' });
                    this.statusBarItem.text = resolverErr;
                }
            }));
        });
    }
    addImport() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this.index.indexReady) {
                this.showCacheWarning();
                return;
            }
            try {
                const selectedItem = yield vscode_1.window.showQuickPick(this.index.declarationInfos.map(o => new quick_pick_items_1.ResolveQuickPickItem(o)), { placeHolder: 'Add import to document:' });
                if (selectedItem) {
                    this.logger.info('Add import to document', { resolveItem: selectedItem });
                    this.addImportToDocument(selectedItem.declarationInfo);
                }
            }
            catch (e) {
                this.logger.error('An error happend during import picking', e);
                vscode_1.window.showErrorMessage('The import cannot be completed, there was an error during the process.');
            }
        });
    }
    addImportUnderCursor() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!vscode_1.window.activeTextEditor) {
                return;
            }
            if (!this.index.indexReady) {
                this.showCacheWarning();
                return;
            }
            try {
                const selectedSymbol = this.getSymbolUnderCursor();
                if (!!!selectedSymbol) {
                    return;
                }
                const resolveItems = yield this.getDeclarationsForImport({
                    cursorSymbol: selectedSymbol,
                    documentSource: vscode_1.window.activeTextEditor.document.getText(),
                    documentPath: vscode_1.window.activeTextEditor.document.fileName,
                });
                if (resolveItems.length < 1) {
                    vscode_1.window.showInformationMessage(`The symbol '${selectedSymbol}' was not found in the index or is already imported.`);
                }
                else if (resolveItems.length === 1 && resolveItems[0].declaration.name === selectedSymbol) {
                    this.logger.info('Add import to document', { resolveItem: resolveItems[0] });
                    this.addImportToDocument(resolveItems[0]);
                }
                else {
                    const selectedItem = yield vscode_1.window.showQuickPick(resolveItems.map(o => new quick_pick_items_1.ResolveQuickPickItem(o)), { placeHolder: 'Multiple declarations found:' });
                    if (selectedItem) {
                        this.logger.info('Add import to document', { resolveItem: selectedItem });
                        this.addImportToDocument(selectedItem.declarationInfo);
                    }
                }
            }
            catch (e) {
                this.logger.error('An error happend during import picking', e);
                vscode_1.window.showErrorMessage('The import cannot be completed, there was an error during the process.');
            }
        });
    }
    addMissingImports() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!vscode_1.window.activeTextEditor) {
                return;
            }
            if (!this.index.indexReady) {
                this.showCacheWarning();
                return;
            }
            try {
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
                this.logger.error('An error happend during import fixing', e);
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
                const ctrl = yield managers_1.ImportManager.create(vscode_1.window.activeTextEditor.document);
                return yield ctrl.organizeImports().commit();
            }
            catch (e) {
                this.logger.error('An error happend during "organize imports".', { error: e });
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
        vscode_1.window.showWarningMessage('Please wait a few seconds longer until the symbol cache has been build.');
    }
    getDeclarationsForImport({ cursorSymbol, documentSource, documentPath }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.logger.info(`Calculate possible imports for document with filter "${cursorSymbol}"`);
            const parsedSource = yield this.parser.parseSource(documentSource);
            const activeDocumentDeclarations = parsedSource.declarations.map(o => o.name);
            const declarations = helpers_1.getDeclarationsFilteredByImports(this.index.declarationInfos, documentPath, parsedSource.imports, this.rootPath).filter(o => o.declaration.name.startsWith(cursorSymbol));
            return [
                ...declarations.filter(o => o.from.startsWith('/')),
                ...declarations.filter(o => !o.from.startsWith('/')),
            ].filter(o => activeDocumentDeclarations.indexOf(o.declaration.name) === -1);
        });
    }
    getMissingDeclarationsForFile({ documentSource, documentPath }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const parsedDocument = yield this.parser.parseSource(documentSource);
            const missingDeclarations = [];
            const declarations = helpers_1.getDeclarationsFilteredByImports(this.index.declarationInfos, documentPath, parsedDocument.imports, this.rootPath);
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
        this.context.subscriptions.push(vscode_1.commands.registerCommand('typescriptHero.resolve.rebuildCache', () => this.buildIndex()));
    }
};
ImportResolveExtension = tslib_1.__decorate([
    inversify_1.injectable(),
    tslib_1.__param(0, inversify_1.inject(IoCSymbols_1.iocSymbols.extensionContext)),
    tslib_1.__param(1, inversify_1.inject(IoCSymbols_1.iocSymbols.loggerFactory)),
    tslib_1.__param(2, inversify_1.inject(IoCSymbols_1.iocSymbols.configuration)),
    tslib_1.__param(3, inversify_1.inject(IoCSymbols_1.iocSymbols.typescriptParser)),
    tslib_1.__param(4, inversify_1.inject(IoCSymbols_1.iocSymbols.declarationIndex)),
    tslib_1.__param(5, inversify_1.inject(IoCSymbols_1.iocSymbols.rootPath)),
    tslib_1.__metadata("design:paramtypes", [Object, Function, Object, typescript_parser_1.TypescriptParser,
        typescript_parser_1.DeclarationIndex, String])
], ImportResolveExtension);
exports.ImportResolveExtension = ImportResolveExtension;
