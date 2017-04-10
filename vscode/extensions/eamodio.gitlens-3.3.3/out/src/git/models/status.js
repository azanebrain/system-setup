'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const path = require("path");
class GitStatusFile {
    constructor(repoPath, status, fileName, staged, originalFileName) {
        this.repoPath = repoPath;
        this.status = status;
        this.fileName = fileName;
        this.staged = staged;
        this.originalFileName = originalFileName;
    }
    getIcon() {
        return getGitStatusIcon(this.status);
    }
    get Uri() {
        return vscode_1.Uri.file(path.resolve(this.repoPath, this.fileName));
    }
}
exports.GitStatusFile = GitStatusFile;
const statusOcticonsMap = {
    '!': '$(diff-ignored)',
    '?': '$(diff-added)',
    A: '$(diff-added)',
    C: '$(diff-added)',
    D: '$(diff-removed)',
    M: '$(diff-modified)',
    R: '$(diff-renamed)',
    U: '$(question)'
};
function getGitStatusIcon(status, missing = '\u00a0\u00a0\u00a0\u00a0') {
    return statusOcticonsMap[status] || missing;
}
exports.getGitStatusIcon = getGitStatusIcon;
//# sourceMappingURL=status.js.map