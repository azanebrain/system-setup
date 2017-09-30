'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const constants_1 = require("../constants");
const gitService_1 = require("../gitService");
class ExplorerNode {
    constructor(uri) {
        this.uri = uri;
    }
    getCommand() {
        return undefined;
    }
}
exports.ExplorerNode = ExplorerNode;
class MessageNode extends ExplorerNode {
    constructor(message) {
        super(new gitService_1.GitUri());
        this.message = message;
        this.resourceType = 'gitlens:message';
    }
    getChildren() {
        return [];
    }
    getTreeItem() {
        const item = new vscode_1.TreeItem(this.message, vscode_1.TreeItemCollapsibleState.None);
        item.contextValue = this.resourceType;
        return item;
    }
}
exports.MessageNode = MessageNode;
class PagerNode extends ExplorerNode {
    constructor(message, node, context) {
        super(new gitService_1.GitUri());
        this.message = message;
        this.node = node;
        this.context = context;
        this.resourceType = 'gitlens:pager';
        this.args = {};
    }
    getChildren() {
        return [];
    }
    getTreeItem() {
        const item = new vscode_1.TreeItem(this.message, vscode_1.TreeItemCollapsibleState.None);
        item.contextValue = this.resourceType;
        item.command = this.getCommand();
        item.iconPath = {
            dark: this.context.asAbsolutePath('images/dark/icon-unfold.svg'),
            light: this.context.asAbsolutePath('images/light/icon-unfold.svg')
        };
        return item;
    }
    getCommand() {
        return {
            title: 'Refresh',
            command: 'gitlens.gitExplorer.refreshNode',
            arguments: [this.node, this.args]
        };
    }
}
exports.PagerNode = PagerNode;
class ShowAllNode extends PagerNode {
    constructor(message, node, context) {
        super(`${message} ${constants_1.GlyphChars.Space}${constants_1.GlyphChars.Dash}${constants_1.GlyphChars.Space} this may take a while`, node, context);
        this.args = { maxCount: 0 };
    }
}
exports.ShowAllNode = ShowAllNode;
//# sourceMappingURL=explorerNode.js.map