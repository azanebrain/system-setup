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
const vscode_1 = require("vscode");
const common_1 = require("./common");
const gitService_1 = require("../gitService");
const logger_1 = require("../logger");
const quickPicks_1 = require("../quickPicks");
const path = require("path");
class ShowQuickCommitDetailsCommand extends common_1.ActiveEditorCachedCommand {
    constructor(git) {
        super(common_1.Commands.ShowQuickCommitDetails);
        this.git = git;
    }
    execute(editor, uri, sha, commit, goBackCommand, repoLog) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(uri instanceof vscode_1.Uri)) {
                if (!editor || !editor.document)
                    return undefined;
                uri = editor.document.uri;
            }
            const gitUri = yield gitService_1.GitUri.fromUri(uri, this.git);
            let repoPath = gitUri.repoPath;
            let workingFileName = path.relative(repoPath, gitUri.fsPath);
            if (!sha) {
                if (!editor)
                    return undefined;
                const blameline = editor.selection.active.line - gitUri.offset;
                if (blameline < 0)
                    return undefined;
                try {
                    const blame = yield this.git.getBlameForLine(gitUri, blameline);
                    if (!blame)
                        return vscode_1.window.showWarningMessage(`Unable to show commit details. File is probably not under source control`);
                    sha = blame.commit.isUncommitted ? blame.commit.previousSha : blame.commit.sha;
                    repoPath = blame.commit.repoPath;
                    workingFileName = blame.commit.fileName;
                    commit = blame.commit;
                }
                catch (ex) {
                    logger_1.Logger.error(ex, 'ShowQuickCommitDetailsCommand', `getBlameForLine(${blameline})`);
                    return vscode_1.window.showErrorMessage(`Unable to show commit details. See output channel for more details`);
                }
            }
            try {
                if (!commit || (commit.type !== 'branch' && commit.type !== 'stash')) {
                    if (repoLog) {
                        commit = repoLog.commits.get(sha);
                        if (!commit) {
                            repoLog = undefined;
                        }
                    }
                    if (!repoLog) {
                        const log = yield this.git.getLogForRepo(repoPath, sha, 2);
                        if (!log)
                            return vscode_1.window.showWarningMessage(`Unable to show commit details`);
                        commit = log.commits.get(sha);
                    }
                }
                if (!commit.workingFileName) {
                    commit.workingFileName = workingFileName;
                }
                if (!goBackCommand) {
                    goBackCommand = new quickPicks_1.CommandQuickPickItem({
                        label: `go back \u21A9`,
                        description: `\u00a0 \u2014 \u00a0\u00a0 to branch history`
                    }, common_1.Commands.ShowQuickCurrentBranchHistory, [new gitService_1.GitUri(commit.uri, commit)]);
                }
                const currentCommand = new quickPicks_1.CommandQuickPickItem({
                    label: `go back \u21A9`,
                    description: `\u00a0 \u2014 \u00a0\u00a0 to details of \u00a0$(git-commit) ${commit.shortSha}`
                }, common_1.Commands.ShowQuickCommitDetails, [new gitService_1.GitUri(commit.uri, commit), sha, commit, goBackCommand, repoLog]);
                const pick = yield quickPicks_1.CommitDetailsQuickPick.show(this.git, commit, uri, goBackCommand, currentCommand, repoLog);
                if (!pick)
                    return undefined;
                if (!(pick instanceof quickPicks_1.CommitWithFileStatusQuickPickItem)) {
                    return pick.execute();
                }
                return vscode_1.commands.executeCommand(common_1.Commands.ShowQuickCommitFileDetails, pick.gitUri, pick.sha, commit, currentCommand);
            }
            catch (ex) {
                logger_1.Logger.error(ex, 'ShowQuickCommitDetailsCommand');
                return vscode_1.window.showErrorMessage(`Unable to show commit details. See output channel for more details`);
            }
        });
    }
}
exports.ShowQuickCommitDetailsCommand = ShowQuickCommitDetailsCommand;
//# sourceMappingURL=showQuickCommitDetails.js.map