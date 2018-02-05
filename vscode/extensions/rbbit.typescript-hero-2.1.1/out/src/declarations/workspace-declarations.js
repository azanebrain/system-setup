"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const typescript_parser_1 = require("typescript-parser");
const vscode_1 = require("vscode");
const ioc_1 = require("../ioc");
const ioc_symbols_1 = require("../ioc-symbols");
class WorkspaceDeclarations {
    constructor(folder) {
        this.folder = folder;
        this._workspaceStateChanged = new vscode_1.EventEmitter();
        this.disposables = [];
        this.logger.debug('Creating workspace declarations index.', { workspace: this.folder.uri.fsPath });
        this.disposables.push(this._workspaceStateChanged);
        this.initialize();
    }
    get workspaceStateChanged() {
        return this._workspaceStateChanged.event;
    }
    get index() {
        return this._index;
    }
    get parser() {
        return ioc_1.default.get(ioc_symbols_1.default.parser);
    }
    get logger() {
        return ioc_1.default.get(ioc_symbols_1.default.logger);
    }
    get config() {
        return ioc_1.default.get(ioc_symbols_1.default.configuration);
    }
    dispose() {
        this.logger.debug('Disposing workspace declarations index.', { workspace: this.folder.uri.fsPath });
        for (const disposable of this.disposables) {
            disposable.dispose();
        }
        this._index.reset();
    }
    initialize() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const profiler = this.logger.startTimer();
            this._workspaceStateChanged.fire(1);
            this._index = new typescript_parser_1.DeclarationIndex(this.parser, this.folder.uri.fsPath);
            const files = yield this.findFiles();
            const watcher = vscode_1.workspace.createFileSystemWatcher(new vscode_1.RelativePattern(this.folder, '{**/*.ts,**/*.tsx,**/package.json,**/typings.json}'));
            watcher.onDidChange(uri => this.fileWatcherEvent('created', uri));
            watcher.onDidChange(uri => this.fileWatcherEvent('updated', uri));
            watcher.onDidDelete(uri => this.fileWatcherEvent('deleted', uri));
            this.disposables.push(watcher);
            try {
                yield this._index.buildIndex(files);
                this._workspaceStateChanged.fire(0);
                profiler.done({
                    message: 'Built index for workspace',
                    workspace: this.folder.uri.fsPath,
                });
            }
            catch (error) {
                this._workspaceStateChanged.fire(2);
                this.logger.error('Error during indexing of workspacefiles', { error: error.toString(), workspace: this.folder.uri.fsPath });
            }
        });
    }
    fileWatcherEvent(event, uri) {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        if (!this.watcherEvents) {
            this.watcherEvents = {
                created: [],
                updated: [],
                deleted: [],
            };
        }
        this.watcherEvents[event].push(uri.fsPath);
        this.timeout = setTimeout(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (this.watcherEvents) {
                const profiler = this.logger.startTimer();
                this.logger.debug('Rebuilding index for workspace', { workspace: this.folder.uri.fsPath });
                this._workspaceStateChanged.fire(1);
                try {
                    yield this._index.reindexForChanges(this.watcherEvents);
                    profiler.done({
                        message: 'Rebuilt index for workspace',
                        workspace: this.folder.uri.fsPath,
                    });
                    this._workspaceStateChanged.fire(0);
                }
                catch (e) {
                    this._workspaceStateChanged.fire(2);
                    this.logger.error('Error during reindex of workspacefiles', { workspace: this.folder.uri.fsPath });
                }
                finally {
                    this.watcherEvents = undefined;
                }
            }
        }), 500);
    }
    findFiles() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const workspaceExcludes = [
                ...this.config.index.workspaceIgnorePatterns(this.folder.uri),
                'node_modules/**/*',
                'typings/**/*',
            ];
            const moduleExcludes = this.config.index.moduleIgnorePatterns(this.folder.uri);
            this.logger.debug('Calculated excludes for workspace.', {
                workspaceExcludes,
                moduleExcludes,
                workspace: this.folder.uri.fsPath,
            });
            const searches = [
                vscode_1.workspace.findFiles(new vscode_1.RelativePattern(this.folder, '{**/*.ts,**/*.tsx}'), new vscode_1.RelativePattern(this.folder, `{${workspaceExcludes.join(',')}}`)),
            ];
            const rootPath = this.folder.uri.fsPath;
            const hasPackageJson = yield fs_extra_1.exists(path_1.join(rootPath, 'package.json'));
            if (rootPath && hasPackageJson) {
                this.logger.debug('Found package.json, calculate searchable node modules.', {
                    workspace: this.folder.uri.fsPath,
                    packageJson: path_1.join(rootPath, 'package.json'),
                });
                let globs = [];
                let ignores = [];
                const packageJson = require(path_1.join(rootPath, 'package.json'));
                for (const folder of ['dependencies', 'devDependencies']) {
                    if (packageJson[folder]) {
                        globs = globs.concat(Object.keys(packageJson[folder]).map(o => `node_modules/${o}/**/*.d.ts`));
                        ignores = ignores.concat(Object.keys(packageJson[folder]).reduce((all, pkg) => {
                            return all.concat(moduleExcludes.map(exclude => `node_modules/${pkg}/${exclude}`));
                        }, []));
                    }
                }
                this.logger.debug('Calculated node module search.', {
                    globs,
                    ignores,
                    workspace: this.folder.uri.fsPath,
                });
                searches.push(vscode_1.workspace.findFiles(new vscode_1.RelativePattern(this.folder, `{${globs.join(',')}}`), new vscode_1.RelativePattern(this.folder, `{${ignores.join(',')}}`)));
            }
            const uris = yield Promise.all(searches);
            return uris
                .reduce((all, cur) => all.concat(cur), [])
                .map(o => o.fsPath);
        });
    }
}
exports.default = WorkspaceDeclarations;
