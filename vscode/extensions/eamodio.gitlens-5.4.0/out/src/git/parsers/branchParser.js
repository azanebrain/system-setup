'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const git_1 = require("./../git");
const branchWithTrackingRegex = /^(\*?)\s+(.+?)\s+([0-9,a-f]+)\s+(?:\[(.*?\/.*?)(?:\:|\]))?/gm;
class GitBranchParser {
    static parse(data, repoPath) {
        if (!data)
            return undefined;
        const branches = [];
        let match = null;
        do {
            match = branchWithTrackingRegex.exec(data);
            if (match == null)
                break;
            branches.push(new git_1.GitBranch(repoPath, match[2], match[1] === '*', match[4]));
        } while (match != null);
        if (!branches.length)
            return undefined;
        return branches;
    }
}
exports.GitBranchParser = GitBranchParser;
//# sourceMappingURL=branchParser.js.map