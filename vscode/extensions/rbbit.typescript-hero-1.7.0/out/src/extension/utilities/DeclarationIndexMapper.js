"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const typescript_parser_1 = require("typescript-parser");
const vscode_1 = require("vscode");
const helpers_1 = require("../../common/helpers");
const IoCSymbols_1 = require("../../extension/IoCSymbols");
let DeclarationIndexMapper = DeclarationIndexMapper_1 = class DeclarationIndexMapper {
    constructor(logger, context, parser, config) {
        this.logger = logger;
        this.context = context;
        this.parser = parser;
        this.config = config;
        this.indizes = {};
        this._onFinishIndexing = new vscode_1.EventEmitter();
        this._onStartIndexing = new vscode_1.EventEmitter();
        this._onIndexingError = new vscode_1.EventEmitter();
        this.onFinishIndexing = this._onFinishIndexing.event;
        this.onStartIndexing = this._onStartIndexing.event;
        this.onIndexingError = this._onIndexingError.event;
        this.context.subscriptions.push(this._onFinishIndexing);
        this.context.subscriptions.push(this._onIndexingError);
        this.context.subscriptions.push(this._onStartIndexing);
    }
    initialize() {
        this.context.subscriptions.push(vscode_1.workspace.onDidChangeWorkspaceFolders(e => this.workspaceChanged(e)));
        this.logger.info('[%s] initializing index mapper for %d workspaces', DeclarationIndexMapper_1.name, (vscode_1.workspace.workspaceFolders || []).length);
        for (const folder of (vscode_1.workspace.workspaceFolders || []).filter(workspace => workspace.uri.scheme === 'file')) {
            this.initializeIndex(folder);
        }
        this.logger.info('[%s] initialized', DeclarationIndexMapper_1.name);
    }
    rebuildAll() {
        this.logger.info('[%s] rebuilding all indices', DeclarationIndexMapper_1.name);
        for (const index of Object.values(this.indizes)) {
            index.watcher.dispose();
            index.index.reset();
        }
        this.indizes = {};
        for (const folder of (vscode_1.workspace.workspaceFolders || []).filter(workspace => workspace.uri.scheme === 'file')) {
            this.initializeIndex(folder);
        }
    }
    getIndexForFile(fileUri) {
        const workspaceFolder = vscode_1.workspace.getWorkspaceFolder(fileUri);
        if (!workspaceFolder || !this.indizes[workspaceFolder.uri.fsPath]) {
            this.logger.debug('[%s] did not find index for file', DeclarationIndexMapper_1.name, { file: fileUri.fsPath });
            return;
        }
        return this.indizes[workspaceFolder.uri.fsPath].index;
    }
    workspaceChanged(event) {
        this.logger.info('[%s] workspaces changed, adjusting indices', DeclarationIndexMapper_1.name);
        for (const add of event.added) {
            this.logger.debug('[%s] add workspace for "%s"', DeclarationIndexMapper_1.name, add.uri.fsPath);
            if (this.indizes[add.uri.fsPath]) {
                this.logger.warn('[%s] workspace index "%s" already exists, skipping', DeclarationIndexMapper_1.name, add.uri.fsPath);
                continue;
            }
            this.initializeIndex(add);
        }
        for (const remove of event.removed) {
            this.logger.debug('[%s] remove workspace for "%s"', DeclarationIndexMapper_1.name, remove.uri.fsPath);
            this.indizes[remove.uri.fsPath].index.reset();
            this.indizes[remove.uri.fsPath].watcher.dispose();
            delete this.indizes[remove.uri.fsPath];
        }
    }
    initializeIndex(folder) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const profiler = this.logger.startTimer();
            this.logger.debug('[%s] initialize index for "%s"', DeclarationIndexMapper_1.name, folder.uri.fsPath);
            const index = new typescript_parser_1.DeclarationIndex(this.parser, folder.uri.fsPath);
            const config = this.config(folder.uri);
            const files = yield helpers_1.findFiles(config, folder);
            const watcher = vscode_1.workspace.createFileSystemWatcher(new vscode_1.RelativePattern(folder, `{${config.resolver.resolverModeFileGlobs.join(',')},**/package.json,**/typings.json}`));
            const workspaceIndex = {
                index,
                folder,
                watcher,
            };
            this._onStartIndexing.fire(workspaceIndex);
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
                timeout = setTimeout(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    if (events) {
                        const profiler = this.logger.startTimer();
                        this.logger.debug('[%s] rebuilding index for index "%s"', DeclarationIndexMapper_1.name, folder.uri.fsPath);
                        yield index.reindexForChanges(events);
                        profiler.done({
                            message: `[${DeclarationIndexMapper_1.name}] rebuilt index for workspace "${folder.name}"`,
                        });
                        events = undefined;
                    }
                }), 500);
            };
            watcher.onDidCreate(uri => fileWatcherEvent('created', uri));
            watcher.onDidChange(uri => fileWatcherEvent('updated', uri));
            watcher.onDidDelete(uri => fileWatcherEvent('deleted', uri));
            try {
                yield index.buildIndex(files);
                this.indizes[folder.uri.fsPath] = workspaceIndex;
                this._onFinishIndexing.fire(workspaceIndex);
                profiler.done({
                    message: `[${DeclarationIndexMapper_1.name}] built index for workspace "${folder.name}"`,
                });
            }
            catch (error) {
                this.logger.error('[%s] could not build index for workspace "%s", error: %s', DeclarationIndexMapper_1.name, folder.uri.fsPath, error);
                this._onIndexingError.fire({ error, index: workspaceIndex });
            }
        });
    }
};
tslib_1.__decorate([
    inversify_1.postConstruct(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", void 0)
], DeclarationIndexMapper.prototype, "initialize", null);
DeclarationIndexMapper = DeclarationIndexMapper_1 = tslib_1.__decorate([
    inversify_1.injectable(),
    tslib_1.__param(0, inversify_1.inject(IoCSymbols_1.iocSymbols.logger)),
    tslib_1.__param(1, inversify_1.inject(IoCSymbols_1.iocSymbols.extensionContext)),
    tslib_1.__param(2, inversify_1.inject(IoCSymbols_1.iocSymbols.typescriptParser)),
    tslib_1.__param(3, inversify_1.inject(IoCSymbols_1.iocSymbols.configuration)),
    tslib_1.__metadata("design:paramtypes", [Object, Object, typescript_parser_1.TypescriptParser, Function])
], DeclarationIndexMapper);
exports.DeclarationIndexMapper = DeclarationIndexMapper;
var DeclarationIndexMapper_1;
