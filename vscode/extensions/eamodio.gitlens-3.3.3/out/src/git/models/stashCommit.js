'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const logCommit_1 = require("./logCommit");
class GitStashCommit extends logCommit_1.GitLogCommit {
    constructor(stashName, repoPath, sha, fileName, date, message, status, fileStatuses, lines, originalFileName, previousSha, previousFileName) {
        super('stash', repoPath, sha, fileName, undefined, date, message, status, fileStatuses, lines, originalFileName, previousSha, previousFileName);
        this.stashName = stashName;
    }
    get shortSha() {
        return this.stashName;
    }
}
exports.GitStashCommit = GitStashCommit;
//# sourceMappingURL=stashCommit.js.map