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
class ShowQuickBranchHistoryCommand extends common_1.ActiveEditorCachedCommand {
    constructor(git) {
        super(common_1.Commands.ShowQuickBranchHistory);
        this.git = git;
    }
    execute(editor, uri, branch, maxCount, goBackCommand, log, nextPageCommand) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(uri instanceof vscode_1.Uri)) {
                uri = editor && editor.document && editor.document.uri;
            }
            const gitUri = uri && (yield gitService_1.GitUri.fromUri(uri, this.git));
            if (maxCount == null) {
                maxCount = this.git.config.advanced.maxQuickHistory;
            }
            let progressCancellation = branch && quickPicks_1.BranchHistoryQuickPick.showProgress(branch);
            try {
                const repoPath = (gitUri && gitUri.repoPath) || this.git.repoPath;
                if (!repoPath)
                    return vscode_1.window.showWarningMessage(`Unable to show branch history`);
                if (!branch) {
                    const branches = yield this.git.getBranches(repoPath);
                    const pick = yield quickPicks_1.BranchesQuickPick.show(branches, `Show history for branch\u2026`);
                    if (!pick)
                        return undefined;
                    if (pick instanceof quickPicks_1.CommandQuickPickItem) {
                        return pick.execute();
                    }
                    branch = pick.branch.name;
                    if (!branch)
                        return undefined;
                    progressCancellation = quickPicks_1.BranchHistoryQuickPick.showProgress(branch);
                }
                if (!log) {
                    log = yield this.git.getLogForRepo(repoPath, (gitUri && gitUri.sha) || branch, maxCount);
                    if (!log)
                        return vscode_1.window.showWarningMessage(`Unable to show branch history`);
                }
                if (progressCancellation.token.isCancellationRequested)
                    return undefined;
                const pick = yield quickPicks_1.BranchHistoryQuickPick.show(this.git, log, gitUri, branch, progressCancellation, goBackCommand, nextPageCommand);
                if (!pick)
                    return undefined;
                if (pick instanceof quickPicks_1.CommandQuickPickItem) {
                    return pick.execute();
                }
                return vscode_1.commands.executeCommand(common_1.Commands.ShowQuickCommitDetails, new gitService_1.GitUri(pick.commit.uri, pick.commit), pick.commit.sha, pick.commit, new quickPicks_1.CommandQuickPickItem({
                    label: `go back \u21A9`,
                    description: `\u00a0 \u2014 \u00a0\u00a0 to \u00a0$(git-branch) ${branch} history`
                }, common_1.Commands.ShowQuickBranchHistory, [uri, branch, maxCount, goBackCommand, log]), log);
            }
            catch (ex) {
                logger_1.Logger.error(ex, 'ShowQuickBranchHistoryCommand');
                return vscode_1.window.showErrorMessage(`Unable to show branch history. See output channel for more details`);
            }
            finally {
                progressCancellation && progressCancellation.dispose();
            }
        });
    }
}
exports.ShowQuickBranchHistoryCommand = ShowQuickBranchHistoryCommand;
//# sourceMappingURL=showQuickBranchHistory.js.map