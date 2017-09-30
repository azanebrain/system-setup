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
const explorerNode_1 = require("./explorerNode");
const remoteNode_1 = require("./remoteNode");
class RemotesNode extends explorerNode_1.ExplorerNode {
    constructor(uri, context, git) {
        super(uri);
        this.context = context;
        this.git = git;
        this.resourceType = 'gitlens:remotes';
    }
    getChildren() {
        return __awaiter(this, void 0, void 0, function* () {
            const remotes = yield this.git.getRemotes(this.uri.repoPath);
            if (remotes === undefined || remotes.length === 0)
                return [new explorerNode_1.MessageNode('No remotes configured')];
            remotes.sort((a, b) => a.name.localeCompare(b.name));
            return [...system_1.Iterables.map(remotes, r => new remoteNode_1.RemoteNode(r, this.uri, this.context, this.git))];
        });
    }
    getTreeItem() {
        const item = new vscode_1.TreeItem(`Remotes`, vscode_1.TreeItemCollapsibleState.Collapsed);
        item.contextValue = this.resourceType;
        item.iconPath = {
            dark: this.context.asAbsolutePath('images/dark/icon-remote.svg'),
            light: this.context.asAbsolutePath('images/light/icon-remote.svg')
        };
        return item;
    }
}
exports.RemotesNode = RemotesNode;
//# sourceMappingURL=remotesNode.js.map