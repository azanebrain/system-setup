"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const vscode_1 = require("vscode");
const ioc_symbols_1 = require("../ioc-symbols");
const workspace_declarations_1 = require("./workspace-declarations");
var ResolverState;
(function (ResolverState) {
    ResolverState["ok"] = "TSH Resolver $(check)";
    ResolverState["syncing"] = "TSH Resolver $(sync)";
    ResolverState["error"] = "TSH Resolver $(flame)";
})(ResolverState || (ResolverState = {}));
let DeclarationManager = class DeclarationManager {
    constructor(context, logger) {
        this.context = context;
        this.logger = logger;
        this.workspaces = {};
        this.activeWorkspaces = 0;
    }
    setup() {
        this.logger.debug('Setting up DeclarationManager.');
        this.statusBarItem = vscode_1.window.createStatusBarItem(vscode_1.StatusBarAlignment.Left, 4);
        this.statusBarItem.text = ResolverState.ok;
        this.statusBarItem.show();
        this.context.subscriptions.push(this);
        this.context.subscriptions.push(this.statusBarItem);
        this.context.subscriptions.push(vscode_1.workspace.onDidChangeWorkspaceFolders(e => this.workspaceFoldersChanged(e)));
        for (const folder of (vscode_1.workspace.workspaceFolders || []).filter(workspace => workspace.uri.scheme === 'file')) {
            this.createWorkspace(folder);
        }
    }
    getIndexForFile(fileUri) {
        const workspaceFolder = vscode_1.workspace.getWorkspaceFolder(fileUri);
        if (!workspaceFolder || !this.workspaces[workspaceFolder.uri.fsPath]) {
            this.logger.debug('Did not find index for file', { file: fileUri.fsPath });
            return;
        }
        return this.workspaces[workspaceFolder.uri.fsPath].index;
    }
    dispose() {
        this.logger.debug('Disposing DeclarationManager.');
        for (const folder of Object.values(this.workspaces)) {
            folder.dispose();
        }
    }
    workspaceFoldersChanged(event) {
        const added = event.added.filter(e => e.uri.scheme === 'file');
        const removed = event.removed.filter(e => e.uri.scheme === 'file');
        this.logger.info('Workspaces changed, adjusting indices', { added: added.map(e => e.uri.fsPath), removed: removed.map(e => e.uri.fsPath) });
        for (const add of event.added) {
            if (this.workspaces[add.uri.fsPath]) {
                this.logger.warn('Workspace index already exists, skipping', { workspace: add.uri.fsPath });
                continue;
            }
            this.createWorkspace(add);
        }
        for (const remove of event.removed) {
            this.workspaces[remove.uri.fsPath].dispose();
            delete this.workspaces[remove.uri.fsPath];
        }
    }
    workspaceStateChanged(state) {
        if (this.statusBarItem.text === ResolverState.error) {
            return;
        }
        if (state === 2) {
            this.logger.error('A workspace did encounter an error.');
            this.statusBarItem.text = ResolverState.error;
            return;
        }
        if (state === 1) {
            this.logger.debug('A workspace is syncing it\'s files.');
            this.activeWorkspaces++;
            this.statusBarItem.text = ResolverState.syncing;
            return;
        }
        if (state === 0) {
            this.logger.debug('A workspace is done syncing it\'s files.');
            this.activeWorkspaces--;
        }
        if (this.activeWorkspaces <= 0) {
            this.logger.debug('All workspaces are done syncing.');
            this.statusBarItem.text = ResolverState.ok;
        }
    }
    createWorkspace(folder) {
        this.workspaces[folder.uri.fsPath] = new workspace_declarations_1.default(folder);
        this.workspaces[folder.uri.fsPath].workspaceStateChanged(state => this.workspaceStateChanged(state));
        this.workspaceStateChanged(1);
    }
};
tslib_1.__decorate([
    inversify_1.postConstruct(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", void 0)
], DeclarationManager.prototype, "setup", null);
DeclarationManager = tslib_1.__decorate([
    inversify_1.injectable(),
    tslib_1.__param(0, inversify_1.inject(ioc_symbols_1.default.extensionContext)),
    tslib_1.__param(1, inversify_1.inject(ioc_symbols_1.default.logger)),
    tslib_1.__metadata("design:paramtypes", [Object, Object])
], DeclarationManager);
exports.default = DeclarationManager;
