'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const commitFileNode_1 = require("./commitFileNode");
class StashFileNode extends commitFileNode_1.CommitFileNode {
    constructor(status, commit, context, git) {
        super(status, commit, context, git, commitFileNode_1.CommitFileNodeDisplayAs.File);
        this.status = status;
        this.commit = commit;
        this.context = context;
        this.git = git;
        this.resourceType = 'gitlens:stash-file';
    }
    getCommitTemplate() {
        return this.git.config.gitExplorer.stashFormat;
    }
    getCommitFileTemplate() {
        return this.git.config.gitExplorer.stashFileFormat;
    }
}
exports.StashFileNode = StashFileNode;
//# sourceMappingURL=stashFileNode.js.map