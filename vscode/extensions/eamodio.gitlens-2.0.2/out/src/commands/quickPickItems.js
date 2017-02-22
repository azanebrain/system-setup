'use strict';
const vscode_1 = require("vscode");
const gitProvider_1 = require("../gitProvider");
const moment = require("moment");
const path = require("path");
class CommitQuickPickItem {
    constructor(commit, descriptionSuffix = '') {
        this.commit = commit;
        this.label = `${commit.author}, ${moment(commit.date).fromNow()}`;
        this.description = `$(git-commit) ${commit.sha}${descriptionSuffix}`;
        this.detail = commit.message;
    }
}
exports.CommitQuickPickItem = CommitQuickPickItem;
class FileQuickPickItem {
    constructor(commit, fileName) {
        this.fileName = fileName;
        this.label = fileName;
        this.uri = gitProvider_1.GitUri.fromUri(vscode_1.Uri.file(path.resolve(commit.repoPath, fileName)));
    }
}
exports.FileQuickPickItem = FileQuickPickItem;
class ShowAllCommitsQuickPickItem {
    constructor(maxItems) {
        this.label = `Show All Commits`;
        this.description = `\u2014 Currently only showing the first ${maxItems} commits`;
        this.detail = `This may take a while`;
    }
}
exports.ShowAllCommitsQuickPickItem = ShowAllCommitsQuickPickItem;
//# sourceMappingURL=quickPickItems.js.map