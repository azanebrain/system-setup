"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const explorerNode_1 = require("./explorerNode");
const statusFilesNode_1 = require("./statusFilesNode");
const statusUpstreamNode_1 = require("./statusUpstreamNode");
let _eventDisposable;
class StatusNode extends explorerNode_1.ExplorerNode {
    constructor(uri, context, git) {
        super(uri);
        this.context = context;
        this.git = git;
        this.resourceType = 'gitlens:status';
    }
    getChildren() {
        return __awaiter(this, void 0, void 0, function* () {
            const status = yield this.git.getStatusForRepo(this.uri.repoPath);
            if (status === undefined)
                return [];
            const children = [];
            if (status.state.behind) {
                children.push(new statusUpstreamNode_1.StatusUpstreamNode(status, 'behind', this.context, this.git));
            }
            if (status.state.ahead) {
                children.push(new statusUpstreamNode_1.StatusUpstreamNode(status, 'ahead', this.context, this.git));
            }
            if (status.state.ahead || (status.files.length !== 0 && this.includeWorkingTree)) {
                const range = status.upstream
                    ? `${status.upstream}..${status.branch}`
                    : undefined;
                children.push(new statusFilesNode_1.StatusFilesNode(status, range, this.context, this.git));
            }
            return children;
        });
    }
    getTreeItem() {
        return __awaiter(this, void 0, void 0, function* () {
            const status = yield this.git.getStatusForRepo(this.uri.repoPath);
            if (status === undefined)
                return new vscode_1.TreeItem('No repo status');
            if (_eventDisposable !== undefined) {
                _eventDisposable.dispose();
                _eventDisposable = undefined;
            }
            if (this.includeWorkingTree) {
                this._status = status;
                _eventDisposable = this.git.onDidChangeFileSystem(this.onFileSystemChanged, this);
                this.git.startWatchingFileSystem();
            }
            let hasChildren = false;
            const hasWorkingChanges = status.files.length !== 0 && this.includeWorkingTree;
            let label = '';
            let iconSuffix = '';
            if (status.upstream) {
                if (!status.state.ahead && !status.state.behind) {
                    label = `${status.branch}${hasWorkingChanges ? ' has uncommitted changes and' : ''} is up-to-date with ${status.upstream}`;
                }
                else {
                    label = `${status.branch}${hasWorkingChanges ? ' has uncommitted changes and' : ''} is not up-to-date with ${status.upstream}`;
                    hasChildren = true;
                    if (status.state.ahead && status.state.behind) {
                        iconSuffix = '-yellow';
                    }
                    else if (status.state.ahead) {
                        iconSuffix = '-green';
                    }
                    else if (status.state.behind) {
                        iconSuffix = '-red';
                    }
                }
            }
            else {
                label = `${status.branch} ${hasWorkingChanges ? 'has uncommitted changes' : this.includeWorkingTree ? 'has no changes' : 'has nothing to commit'}`;
            }
            const item = new vscode_1.TreeItem(label, (hasChildren || hasWorkingChanges) ? vscode_1.TreeItemCollapsibleState.Expanded : vscode_1.TreeItemCollapsibleState.None);
            item.contextValue = this.resourceType;
            item.iconPath = {
                dark: this.context.asAbsolutePath(`images/dark/icon-repo${iconSuffix}.svg`),
                light: this.context.asAbsolutePath(`images/light/icon-repo${iconSuffix}.svg`)
            };
            return item;
        });
    }
    get includeWorkingTree() {
        return this.git.config.gitExplorer.includeWorkingTree;
    }
    onFileSystemChanged(uri) {
        return __awaiter(this, void 0, void 0, function* () {
            const status = yield this.git.getStatusForRepo(this.uri.repoPath);
            if (this._status !== undefined && status !== undefined &&
                ((this._status.files.length === status.files.length) || (this._status.files.length > 0 && status.files.length > 0))) {
                vscode_1.commands.executeCommand('gitlens.gitExplorer.refreshNode', this);
            }
            vscode_1.commands.executeCommand('gitlens.gitExplorer.refresh');
        });
    }
}
exports.StatusNode = StatusNode;
//# sourceMappingURL=statusNode.js.map