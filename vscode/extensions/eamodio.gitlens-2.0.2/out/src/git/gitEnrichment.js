'use strict';
const vscode_1 = require("vscode");
const git_1 = require("./git");
const path = require("path");
class GitCommit {
    constructor(repoPath, sha, fileName, author, date, message, lines, originalFileName, previousSha, previousFileName) {
        this.repoPath = repoPath;
        this.sha = sha;
        this.fileName = fileName;
        this.author = author;
        this.date = date;
        this.message = message;
        this.lines = lines || [];
        this.originalFileName = originalFileName;
        this.previousSha = previousSha;
        this.previousFileName = previousFileName;
    }
    get isUncommitted() {
        if (this._isUncommitted === undefined) {
            this._isUncommitted = git_1.default.isUncommitted(this.sha);
        }
        return this._isUncommitted;
    }
    get previousUri() {
        return this.previousFileName ? vscode_1.Uri.file(path.join(this.repoPath, this.previousFileName)) : this.uri;
    }
    get uri() {
        return vscode_1.Uri.file(path.join(this.repoPath, this.originalFileName || this.fileName));
    }
}
exports.GitCommit = GitCommit;
//# sourceMappingURL=gitEnrichment.js.map