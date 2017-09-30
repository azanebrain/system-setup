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
const vscode_1 = require("vscode");
const branchesNode_1 = require("./branchesNode");
const constants_1 = require("../constants");
const explorerNode_1 = require("./explorerNode");
const remotesNode_1 = require("./remotesNode");
const statusNode_1 = require("./statusNode");
const stashesNode_1 = require("./stashesNode");
class RepositoryNode extends explorerNode_1.ExplorerNode {
    constructor(uri, context, git) {
        super(uri);
        this.context = context;
        this.git = git;
        this.resourceType = 'gitlens:repository';
    }
    getChildren() {
        return __awaiter(this, void 0, void 0, function* () {
            return [
                new statusNode_1.StatusNode(this.uri, this.context, this.git),
                new branchesNode_1.BranchesNode(this.uri, this.context, this.git),
                new remotesNode_1.RemotesNode(this.uri, this.context, this.git),
                new stashesNode_1.StashesNode(this.uri, this.context, this.git)
            ];
        });
    }
    getTreeItem() {
        const item = new vscode_1.TreeItem(`Repository ${constants_1.GlyphChars.Dash} ${this.uri.repoPath}`, vscode_1.TreeItemCollapsibleState.Expanded);
        item.contextValue = this.resourceType;
        return item;
    }
}
exports.RepositoryNode = RepositoryNode;
//# sourceMappingURL=repositoryNode.js.map