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
const commitNode_1 = require("./commitNode");
const constants_1 = require("../constants");
const explorerNode_1 = require("./explorerNode");
class BranchHistoryNode extends explorerNode_1.ExplorerNode {
    constructor(branch, uri, context, git) {
        super(uri);
        this.branch = branch;
        this.context = context;
        this.git = git;
        this.resourceType = 'gitlens:branch-history';
        this.maxCount = undefined;
    }
    getChildren() {
        return __awaiter(this, void 0, void 0, function* () {
            const log = yield this.git.getLogForRepo(this.uri.repoPath, this.branch.name, this.maxCount);
            if (log === undefined)
                return [];
            const children = [...system_1.Iterables.map(log.commits.values(), c => new commitNode_1.CommitNode(c, this.context, this.git, this.branch))];
            if (log.truncated) {
                children.push(new explorerNode_1.ShowAllNode('Show All Commits', this, this.context));
            }
            return children;
        });
    }
    getTreeItem() {
        return __awaiter(this, void 0, void 0, function* () {
            let name = this.branch.getName();
            if (!this.branch.remote && this.branch.tracking !== undefined && this.git.config.gitExplorer.showTrackingBranch) {
                name += ` ${constants_1.GlyphChars.Space}${constants_1.GlyphChars.ArrowLeftRight}${constants_1.GlyphChars.Space} ${this.branch.tracking}`;
            }
            const item = new vscode_1.TreeItem(`${this.branch.current ? `${constants_1.GlyphChars.Check} ${constants_1.GlyphChars.Space}` : ''}${name}`, vscode_1.TreeItemCollapsibleState.Collapsed);
            item.contextValue = this.branch.tracking ? `${this.resourceType}:remote` : this.resourceType;
            item.iconPath = {
                dark: this.context.asAbsolutePath('images/dark/icon-branch.svg'),
                light: this.context.asAbsolutePath('images/light/icon-branch.svg')
            };
            return item;
        });
    }
}
exports.BranchHistoryNode = BranchHistoryNode;
//# sourceMappingURL=branchHistoryNode.js.map