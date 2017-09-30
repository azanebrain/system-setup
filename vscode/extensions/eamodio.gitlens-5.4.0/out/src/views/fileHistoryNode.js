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
const commitFileNode_1 = require("./commitFileNode");
const explorerNode_1 = require("./explorerNode");
class FileHistoryNode extends explorerNode_1.ExplorerNode {
    constructor(uri, context, git) {
        super(uri);
        this.context = context;
        this.git = git;
        this.resourceType = 'gitlens:file-history';
    }
    getChildren() {
        return __awaiter(this, void 0, void 0, function* () {
            const log = yield this.git.getLogForFile(this.uri.repoPath, this.uri.fsPath, this.uri.sha);
            if (log === undefined)
                return [new explorerNode_1.MessageNode('No file history')];
            return [...system_1.Iterables.map(log.commits.values(), c => new commitFileNode_1.CommitFileNode(c.fileStatuses[0], c, this.context, this.git, commitFileNode_1.CommitFileNodeDisplayAs.CommitLabel | commitFileNode_1.CommitFileNodeDisplayAs.StatusIcon))];
        });
    }
    getTreeItem() {
        const item = new vscode_1.TreeItem(`${this.uri.getFormattedPath()}`, vscode_1.TreeItemCollapsibleState.Expanded);
        item.contextValue = this.resourceType;
        item.iconPath = {
            dark: this.context.asAbsolutePath('images/dark/icon-history.svg'),
            light: this.context.asAbsolutePath('images/light/icon-history.svg')
        };
        return item;
    }
}
exports.FileHistoryNode = FileHistoryNode;
//# sourceMappingURL=fileHistoryNode.js.map