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
class ShowQuickFileHistoryCommand extends common_1.ActiveEditorCachedCommand {
    constructor(git) {
        super(common_1.Commands.ShowQuickFileHistory);
        this.git = git;
    }
    execute(editor, uri, range, maxCount, goBackCommand, log, nextPageCommand) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(uri instanceof vscode_1.Uri)) {
                uri = editor && editor.document && editor.document.uri;
            }
            if (!uri)
                return vscode_1.commands.executeCommand(common_1.Commands.ShowQuickCurrentBranchHistory);
            const gitUri = yield gitService_1.GitUri.fromUri(uri, this.git);
            if (maxCount == null) {
                maxCount = this.git.config.advanced.maxQuickHistory;
            }
            const progressCancellation = quickPicks_1.FileHistoryQuickPick.showProgress(gitUri);
            try {
                if (!log) {
                    log = yield this.git.getLogForFile(gitUri.repoPath, gitUri.fsPath, gitUri.sha, maxCount, range);
                    if (!log)
                        return vscode_1.window.showWarningMessage(`Unable to show file history. File is probably not under source control`);
                }
                if (progressCancellation.token.isCancellationRequested)
                    return undefined;
                const pick = yield quickPicks_1.FileHistoryQuickPick.show(this.git, log, gitUri, progressCancellation, goBackCommand, nextPageCommand);
                if (!pick)
                    return undefined;
                if (pick instanceof quickPicks_1.CommandQuickPickItem) {
                    return pick.execute();
                }
                return vscode_1.commands.executeCommand(common_1.Commands.ShowQuickCommitFileDetails, new gitService_1.GitUri(pick.commit.uri, pick.commit), pick.commit.sha, pick.commit, new quickPicks_1.CommandQuickPickItem({
                    label: `go back \u21A9`,
                    description: `\u00a0 \u2014 \u00a0\u00a0 to history of \u00a0$(file-text) ${path.basename(pick.commit.fileName)}${gitUri.sha ? ` from \u00a0$(git-commit) ${gitUri.shortSha}` : ''}`
                }, common_1.Commands.ShowQuickFileHistory, [uri, range, maxCount, goBackCommand, log]), log);
            }
            catch (ex) {
                logger_1.Logger.error(ex, 'ShowQuickFileHistoryCommand');
                return vscode_1.window.showErrorMessage(`Unable to show file history. See output channel for more details`);
            }
            finally {
                progressCancellation.dispose();
            }
        });
    }
}
exports.ShowQuickFileHistoryCommand = ShowQuickFileHistoryCommand;
//# sourceMappingURL=showQuickFileHistory.js.map