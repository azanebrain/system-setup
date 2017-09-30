'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const system_1 = require("../system");
const vscode_1 = require("vscode");
const commands_1 = require("../commands");
const comparers_1 = require("../comparers");
const configuration_1 = require("../configuration");
const constants_1 = require("../constants");
const explorerNodes_1 = require("./explorerNodes");
const gitService_1 = require("../gitService");
__export(require("./explorerNodes"));
exports.GitExplorerView = {
    Auto: 'auto',
    History: 'history',
    Repository: 'repository'
};
class GitExplorer {
    constructor(context, git) {
        this.context = context;
        this.git = git;
        this._onDidChangeTreeData = new vscode_1.EventEmitter();
        vscode_1.commands.registerCommand('gitlens.gitExplorer.switchToHistoryView', () => this.switchTo(exports.GitExplorerView.History), this);
        vscode_1.commands.registerCommand('gitlens.gitExplorer.switchToRepositoryView', () => this.switchTo(exports.GitExplorerView.Repository), this);
        vscode_1.commands.registerCommand('gitlens.gitExplorer.refresh', this.refresh, this);
        vscode_1.commands.registerCommand('gitlens.gitExplorer.refreshNode', this.refreshNode, this);
        vscode_1.commands.registerCommand('gitlens.gitExplorer.openChanges', this.openChanges, this);
        vscode_1.commands.registerCommand('gitlens.gitExplorer.openChangesWithWorking', this.openChangesWithWorking, this);
        vscode_1.commands.registerCommand('gitlens.gitExplorer.openFile', this.openFile, this);
        vscode_1.commands.registerCommand('gitlens.gitExplorer.openFileRevision', this.openFileRevision, this);
        vscode_1.commands.registerCommand('gitlens.gitExplorer.openFileRevisionInRemote', this.openFileRevisionInRemote, this);
        vscode_1.commands.registerCommand('gitlens.gitExplorer.openChangedFiles', this.openChangedFiles, this);
        vscode_1.commands.registerCommand('gitlens.gitExplorer.openChangedFileChanges', this.openChangedFileChanges, this);
        vscode_1.commands.registerCommand('gitlens.gitExplorer.openChangedFileChangesWithWorking', this.openChangedFileChangesWithWorking, this);
        vscode_1.commands.registerCommand('gitlens.gitExplorer.openChangedFileRevisions', this.openChangedFileRevisions, this);
        vscode_1.commands.registerCommand('gitlens.gitExplorer.applyChanges', this.applyChanges, this);
        const repoChangedFn = system_1.Functions.debounce(this.onRepoChanged, 250);
        context.subscriptions.push(this.git.onDidChangeRepo(repoChangedFn, this));
        const editorChangedFn = system_1.Functions.debounce(this.onActiveEditorChanged, 500);
        context.subscriptions.push(vscode_1.window.onDidChangeActiveTextEditor(editorChangedFn, this));
        context.subscriptions.push(vscode_1.workspace.onDidChangeConfiguration(this.onConfigurationChanged, this));
        this.onConfigurationChanged();
    }
    get onDidChangeTreeData() {
        return this._onDidChangeTreeData.event;
    }
    getTreeItem(node) {
        return __awaiter(this, void 0, void 0, function* () {
            return node.getTreeItem();
        });
    }
    getChildren(node) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._root === undefined) {
                if (this._view === exports.GitExplorerView.History)
                    return [new explorerNodes_1.MessageNode('No active file; no history to show')];
                return [];
            }
            if (node === undefined)
                return this._root.getChildren();
            return node.getChildren();
        });
    }
    getRootNode(editor) {
        switch (this._view) {
            case exports.GitExplorerView.History:
                return this.getHistoryNode(editor || vscode_1.window.activeTextEditor);
            default:
                const uri = new gitService_1.GitUri(vscode_1.Uri.file(this.git.repoPath), { repoPath: this.git.repoPath, fileName: this.git.repoPath });
                return new explorerNodes_1.RepositoryNode(uri, this.context, this.git);
        }
    }
    getHistoryNode(editor) {
        if (vscode_1.window.visibleTextEditors.length === 0)
            return undefined;
        if (editor === undefined)
            return this._root;
        const uri = this.git.getGitUriForFile(editor.document.uri) || new gitService_1.GitUri(editor.document.uri, { repoPath: this.git.repoPath, fileName: editor.document.uri.fsPath });
        if (comparers_1.UriComparer.equals(uri, this._root && this._root.uri))
            return this._root;
        return new explorerNodes_1.HistoryNode(uri, this.context, this.git);
    }
    onActiveEditorChanged(editor) {
        if (this._view !== exports.GitExplorerView.History)
            return;
        const root = this.getRootNode(editor);
        if (root === this._root)
            return;
        this._root = root;
        this.refresh(undefined, root);
    }
    onConfigurationChanged() {
        const cfg = vscode_1.workspace.getConfiguration().get(configuration_1.ExtensionKey);
        const changed = !system_1.Objects.areEquivalent(cfg.gitExplorer, this._config && this._config.gitExplorer);
        this._config = cfg;
        if (changed) {
            let view = cfg.gitExplorer.view;
            if (view === exports.GitExplorerView.Auto) {
                view = this.context.workspaceState.get(constants_1.WorkspaceState.GitExplorerView, exports.GitExplorerView.Repository);
            }
            this.setView(view);
            this._root = this.getRootNode(vscode_1.window.activeTextEditor);
            this.refresh();
        }
    }
    onRepoChanged(reasons) {
        if (this._view !== exports.GitExplorerView.Repository)
            return;
        this.refresh();
    }
    refresh(node, root) {
        if (root === undefined && this._view === exports.GitExplorerView.History) {
            this._root = this.getRootNode(vscode_1.window.activeTextEditor);
        }
        this._onDidChangeTreeData.fire(node);
    }
    refreshNode(node, args) {
        if (node instanceof explorerNodes_1.BranchHistoryNode) {
            node.maxCount = args.maxCount;
        }
        this.refresh(node);
    }
    setView(view) {
        if (this._view === view)
            return;
        if (this._config.gitExplorer.view === exports.GitExplorerView.Auto) {
            this.context.workspaceState.update(constants_1.WorkspaceState.GitExplorerView, view);
        }
        this._view = view;
        constants_1.setCommandContext(constants_1.CommandContext.GitExplorerView, this._view);
        if (view !== exports.GitExplorerView.Repository) {
            this.git.stopWatchingFileSystem();
        }
    }
    switchTo(view) {
        if (this._view === view)
            return;
        this.setView(view);
        this._root = this.getRootNode(vscode_1.window.activeTextEditor);
        this.refresh();
    }
    applyChanges(node) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.git.checkoutFile(node.uri);
            return this.openFile(node);
        });
    }
    openChanges(node) {
        const command = node.getCommand();
        if (command === undefined || command.arguments === undefined)
            return;
        const [uri, args] = command.arguments;
        args.showOptions.preview = false;
        return vscode_1.commands.executeCommand(command.command, uri, args);
    }
    openChangesWithWorking(node) {
        const args = {
            commit: node.commit,
            showOptions: {
                preserveFocus: true,
                preview: false
            }
        };
        return vscode_1.commands.executeCommand(commands_1.Commands.DiffWithWorking, new gitService_1.GitUri(node.commit.uri, node.commit), args);
    }
    openFile(node) {
        return commands_1.openEditor(node.uri, { preserveFocus: true, preview: false });
    }
    openFileRevision(node, options = { showOptions: { preserveFocus: true, preview: false } }) {
        return commands_1.openEditor(options.uri || gitService_1.GitService.toGitContentUri(node.uri), options.showOptions || { preserveFocus: true, preview: false });
    }
    openChangedFileChanges(node, options = { preserveFocus: false, preview: false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const repoPath = node.commit.repoPath;
            const uris = node.commit.fileStatuses
                .map(s => gitService_1.GitUri.fromFileStatus(s, repoPath));
            for (const uri of uris) {
                yield this.openDiffWith(repoPath, { uri: uri, sha: node.commit.previousSha !== undefined ? node.commit.previousSha : gitService_1.GitService.fakeSha }, { uri: uri, sha: node.commit.sha }, options);
            }
        });
    }
    openChangedFileChangesWithWorking(node, options = { preserveFocus: false, preview: false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const repoPath = node.commit.repoPath;
            const uris = node.commit.fileStatuses
                .filter(s => s.status !== 'D')
                .map(s => gitService_1.GitUri.fromFileStatus(s, repoPath));
            for (const uri of uris) {
                yield this.openDiffWith(repoPath, { uri: uri, sha: node.commit.sha }, { uri: uri, sha: '' }, options);
            }
        });
    }
    openChangedFiles(node, options = { preserveFocus: false, preview: false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const repoPath = node.commit.repoPath;
            const uris = node.commit.fileStatuses.filter(s => s.status !== 'D').map(s => gitService_1.GitUri.fromFileStatus(s, repoPath));
            for (const uri of uris) {
                yield commands_1.openEditor(uri, options);
            }
        });
    }
    openChangedFileRevisions(node, options = { preserveFocus: false, preview: false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const uris = node.commit.fileStatuses
                .filter(s => s.status !== 'D')
                .map(s => gitService_1.GitService.toGitContentUri(node.commit.sha, s.fileName, node.commit.repoPath, s.originalFileName));
            for (const uri of uris) {
                yield commands_1.openEditor(uri, options);
            }
        });
    }
    openDiffWith(repoPath, lhs, rhs, options = { preserveFocus: false, preview: false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const diffArgs = {
                repoPath: repoPath,
                lhs: lhs,
                rhs: rhs,
                showOptions: options
            };
            return vscode_1.commands.executeCommand(commands_1.Commands.DiffWith, diffArgs);
        });
    }
    openFileRevisionInRemote(node) {
        return __awaiter(this, void 0, void 0, function* () {
            return vscode_1.commands.executeCommand(commands_1.Commands.OpenFileInRemote, new gitService_1.GitUri(node.commit.uri, node.commit), { range: false });
        });
    }
}
exports.GitExplorer = GitExplorer;
//# sourceMappingURL=gitExplorer.js.map