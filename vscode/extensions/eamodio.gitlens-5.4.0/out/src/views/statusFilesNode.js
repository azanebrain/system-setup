'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const system_1 = require("../system");
const vscode_1 = require("vscode");
const configuration_1 = require("../configuration");
const explorerNode_1 = require("./explorerNode");
const folderNode_1 = require("./folderNode");
const gitService_1 = require("../gitService");
const statusFileCommitsNode_1 = require("./statusFileCommitsNode");
const path = require("path");
class StatusFilesNode extends explorerNode_1.ExplorerNode {
    constructor(status, range, context, git, branch) {
        super(new gitService_1.GitUri(vscode_1.Uri.file(status.repoPath), { repoPath: status.repoPath, fileName: status.repoPath }));
        this.status = status;
        this.range = range;
        this.context = context;
        this.git = git;
        this.branch = branch;
        this.resourceType = 'gitlens:status-files';
        this.maxCount = undefined;
        this.repoPath = status.repoPath;
    }
    getChildren() {
        return __awaiter(this, void 0, void 0, function* () {
            let statuses = [];
            const repoPath = this.repoPath;
            let log;
            if (this.range !== undefined) {
                log = yield this.git.getLogForRepo(repoPath, this.range, this.maxCount);
                if (log !== undefined) {
                    statuses = Array.from(system_1.Iterables.flatMap(log.commits.values(), c => {
                        return c.fileStatuses.map(s => {
                            return Object.assign({}, s, { commit: c });
                        });
                    }));
                }
            }
            if (this.status.files.length !== 0 && this.includeWorkingTree) {
                statuses.splice(0, 0, ...this.status.files.map(s => {
                    return Object.assign({}, s, { commit: new gitService_1.GitLogCommit('file', repoPath, gitService_1.GitService.uncommittedSha, s.fileName, 'You', new Date(), '', s.status, [s], s.originalFileName, 'HEAD', s.fileName) });
                }));
            }
            statuses.sort((a, b) => b.commit.date.getTime() - a.commit.date.getTime());
            const groups = system_1.Arrays.groupBy(statuses, s => s.fileName);
            let children = [
                ...system_1.Iterables.map(system_1.Objects.values(groups), statuses => new statusFileCommitsNode_1.StatusFileCommitsNode(repoPath, statuses[statuses.length - 1], statuses.map(s => s.commit), this.context, this.git, this.branch))
            ];
            if (this.git.config.gitExplorer.files.layout !== configuration_1.GitExplorerFilesLayout.List) {
                const hierarchy = system_1.Arrays.makeHierarchical(children, n => n.uri.getRelativePath().split('/'), (...paths) => gitService_1.GitService.normalizePath(path.join(...paths)), this.git.config.gitExplorer.files.compact);
                const root = new folderNode_1.FolderNode(repoPath, '', undefined, hierarchy, this.git.config.gitExplorer);
                children = (yield root.getChildren());
            }
            else {
                children.sort((a, b) => (a.priority ? -1 : 1) - (b.priority ? -1 : 1) || a.label.localeCompare(b.label));
            }
            if (log !== undefined && log.truncated) {
                children.push(new explorerNode_1.ShowAllNode('Show All Changes', this, this.context));
            }
            return children;
        });
    }
    getTreeItem() {
        return __awaiter(this, void 0, void 0, function* () {
            let files = (this.status.files !== undefined && this.includeWorkingTree) ? this.status.files.length : 0;
            if (this.status.upstream !== undefined) {
                const stats = yield this.git.getChangedFilesCount(this.repoPath, `${this.status.upstream}...`);
                if (stats !== undefined) {
                    files += stats.files;
                }
            }
            const label = `${files} file${files > 1 ? 's' : ''} changed`;
            const item = new vscode_1.TreeItem(label, vscode_1.TreeItemCollapsibleState.Collapsed);
            item.contextValue = this.resourceType;
            item.iconPath = {
                dark: this.context.asAbsolutePath(`images/dark/icon-diff.svg`),
                light: this.context.asAbsolutePath(`images/light/icon-diff.svg`)
            };
            return item;
        });
    }
    get includeWorkingTree() {
        return this.git.config.gitExplorer.includeWorkingTree;
    }
}
exports.StatusFilesNode = StatusFilesNode;
//# sourceMappingURL=statusFilesNode.js.map