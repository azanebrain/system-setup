'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const commit_1 = require("./commit");
const git_1 = require("../git");
const path = require("path");
class GitLogCommit extends commit_1.GitCommit {
    constructor(type, repoPath, sha, fileName, author, date, message, status, fileStatuses, originalFileName, previousSha, previousFileName) {
        super(type, repoPath, sha, fileName, author, date, message, originalFileName, previousSha, previousFileName);
        this.fileNames = this.fileName;
        if (fileStatuses) {
            this.fileStatuses = fileStatuses.filter(_ => !!_.fileName);
            const fileStatus = this.fileStatuses[0];
            this.fileName = fileStatus.fileName;
            this.status = fileStatus.status;
        }
        else {
            if (fileName === undefined) {
                this.fileStatuses = [];
            }
            else {
                this.fileStatuses = [{ status: status, fileName: fileName, originalFileName: originalFileName }];
            }
            this.status = status;
        }
    }
    get isMerge() {
        return this.parentShas && this.parentShas.length > 1;
    }
    get nextShortSha() {
        return this.nextSha && git_1.Git.shortenSha(this.nextSha);
    }
    get nextUri() {
        return this.nextFileName ? vscode_1.Uri.file(path.resolve(this.repoPath, this.nextFileName)) : this.uri;
    }
    getDiffStatus() {
        const added = this.fileStatuses.filter(_ => _.status === 'A' || _.status === '?').length;
        const deleted = this.fileStatuses.filter(_ => _.status === 'D').length;
        const changed = this.fileStatuses.filter(_ => _.status !== 'A' && _.status !== '?' && _.status !== 'D').length;
        return `+${added} ~${changed} -${deleted}`;
    }
}
exports.GitLogCommit = GitLogCommit;
//# sourceMappingURL=logCommit.js.map