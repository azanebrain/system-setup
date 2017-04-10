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
class ShowQuickCommitFileDetailsCommand extends common_1.ActiveEditorCachedCommand {
    constructor(git) {
        super(common_1.Commands.ShowQuickCommitFileDetails);
        this.git = git;
    }
    execute(editor, uri, sha, commit, goBackCommand, fileLog) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(uri instanceof vscode_1.Uri)) {
                if (!editor || !editor.document)
                    return undefined;
                uri = editor.document.uri;
            }
            let workingFileName = commit && commit.workingFileName;
            const gitUri = yield gitService_1.GitUri.fromUri(uri, this.git);
            if (!sha) {
                if (!editor)
                    return undefined;
                const blameline = editor.selection.active.line - gitUri.offset;
                if (blameline < 0)
                    return undefined;
                try {
                    const blame = yield this.git.getBlameForLine(gitUri, blameline);
                    if (!blame)
                        return vscode_1.window.showWarningMessage(`Unable to show commit file details. File is probably not under source control`);
                    sha = blame.commit.isUncommitted ? blame.commit.previousSha : blame.commit.sha;
                    commit = blame.commit;
                    workingFileName = path.relative(commit.repoPath, gitUri.fsPath);
                }
                catch (ex) {
                    logger_1.Logger.error(ex, 'ShowQuickCommitFileDetailsCommand', `getBlameForLine(${blameline})`);
                    return vscode_1.window.showErrorMessage(`Unable to show commit file details. See output channel for more details`);
                }
            }
            try {
                if (!commit || (commit.type !== 'file' && commit.type !== 'stash')) {
                    if (fileLog) {
                        commit = fileLog.commits.get(sha);
                        if (!commit) {
                            fileLog = undefined;
                        }
                    }
                    if (!fileLog) {
                        commit = yield this.git.getLogCommit(commit ? commit.repoPath : gitUri.repoPath, commit ? commit.uri.fsPath : gitUri.fsPath, sha, { previous: true });
                        if (!commit)
                            return vscode_1.window.showWarningMessage(`Unable to show commit file details`);
                    }
                }
                commit.workingFileName = workingFileName;
                commit.workingFileName = yield this.git.findWorkingFileName(commit);
                const shortSha = sha.substring(0, 8);
                if (!goBackCommand) {
                    goBackCommand = new quickPicks_1.CommandQuickPickItem({
                        label: `go back \u21A9`,
                        description: `\u00a0 \u2014 \u00a0\u00a0 to details of \u00a0$(git-commit) ${shortSha}`
                    }, common_1.Commands.ShowQuickCommitDetails, [new gitService_1.GitUri(commit.uri, commit), sha, commit]);
                }
                const pick = yield quickPicks_1.CommitFileDetailsQuickPick.show(this.git, commit, uri, goBackCommand, new quickPicks_1.CommandQuickPickItem({
                    label: `go back \u21A9`,
                    description: `\u00a0 \u2014 \u00a0\u00a0 to details of \u00a0$(file-text) ${path.basename(commit.fileName)} in \u00a0$(git-commit) ${shortSha}`
                }, common_1.Commands.ShowQuickCommitFileDetails, [new gitService_1.GitUri(commit.uri, commit), sha, commit, goBackCommand]), fileLog);
                if (!pick)
                    return undefined;
                if (pick instanceof quickPicks_1.CommandQuickPickItem) {
                    return pick.execute();
                }
                return undefined;
            }
            catch (ex) {
                logger_1.Logger.error(ex, 'ShowQuickCommitFileDetailsCommand');
                return vscode_1.window.showErrorMessage(`Unable to show commit file details. See output channel for more details`);
            }
        });
    }
}
exports.ShowQuickCommitFileDetailsCommand = ShowQuickCommitFileDetailsCommand;
//# sourceMappingURL=showQuickCommitFileDetails.js.map