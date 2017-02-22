'use strict';
const vscode_1 = require("vscode");
const constants_1 = require("../constants");
const gitProvider_1 = require("../gitProvider");
class GitUri extends vscode_1.Uri {
    constructor(uri, commit) {
        super();
        if (!uri)
            return;
        const base = this;
        base._scheme = uri.scheme;
        base._authority = uri.authority;
        base._path = uri.path;
        base._query = uri.query;
        base._fragment = uri.fragment;
        this.offset = 0;
        if (uri.scheme === constants_1.DocumentSchemes.Git) {
            const data = gitProvider_1.default.fromGitUri(uri);
            base._fsPath = data.originalFileName || data.fileName;
            this.offset = (data.decoration && data.decoration.split('\n').length) || 0;
            this.repoPath = data.repoPath;
            this.sha = data.sha;
        }
        else if (commit) {
            base._fsPath = commit.originalFileName || commit.fileName;
            this.repoPath = commit.repoPath;
            this.sha = commit.sha;
        }
    }
    fileUri() {
        return vscode_1.Uri.file(this.fsPath);
    }
    static fromUri(uri, git) {
        if (git) {
            const gitUri = git.getGitUriForFile(uri.fsPath);
            if (gitUri)
                return gitUri;
        }
        return new GitUri(uri);
    }
}
exports.GitUri = GitUri;
//# sourceMappingURL=gitUri.js.map