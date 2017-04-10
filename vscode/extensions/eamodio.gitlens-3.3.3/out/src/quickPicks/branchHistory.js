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
const system_1 = require("../system");
const vscode_1 = require("vscode");
const commands_1 = require("../commands");
const common_1 = require("./common");
const gitService_1 = require("../gitService");
const remotes_1 = require("./remotes");
class BranchHistoryQuickPick {
    static showProgress(branch) {
        return common_1.showQuickPickProgress(`${branch} history \u2014 search by commit message, filename, or commit id`, {
            left: commands_1.KeyNoopCommand,
            ',': commands_1.KeyNoopCommand,
            '.': commands_1.KeyNoopCommand
        });
    }
    static show(git, log, uri, branch, progressCancellation, goBackCommand, nextPageCommand) {
        return __awaiter(this, void 0, void 0, function* () {
            const items = Array.from(system_1.Iterables.map(log.commits.values(), c => new common_1.CommitQuickPickItem(c)));
            const currentCommand = new common_1.CommandQuickPickItem({
                label: `go back \u21A9`,
                description: `\u00a0 \u2014 \u00a0\u00a0 to \u00a0$(git-branch) ${branch} history`
            }, commands_1.Commands.ShowQuickBranchHistory, [uri, branch, log.maxCount, goBackCommand, log]);
            items.splice(0, 0, new common_1.CommandQuickPickItem({
                label: `$(search) Show Commit Search`,
                description: `\u00a0 \u2014 \u00a0\u00a0 search for commits by message, author, files, or commit id`
            }, commands_1.Commands.ShowCommitSearch, [new gitService_1.GitUri(vscode_1.Uri.file(log.repoPath), { fileName: '', repoPath: log.repoPath }), undefined, undefined, currentCommand]));
            const remotes = system_1.Arrays.uniqueBy(yield git.getRemotes((uri && uri.repoPath) || git.repoPath), _ => _.url, _ => !!_.provider);
            if (remotes.length) {
                items.splice(0, 0, new remotes_1.OpenRemotesCommandQuickPickItem(remotes, 'branch', branch, currentCommand));
            }
            let previousPageCommand;
            if (log.truncated || log.sha) {
                if (log.truncated) {
                    items.splice(0, 0, new common_1.CommandQuickPickItem({
                        label: `$(sync) Show All Commits`,
                        description: `\u00a0 \u2014 \u00a0\u00a0 this may take a while`
                    }, commands_1.Commands.ShowQuickBranchHistory, [
                        new gitService_1.GitUri(vscode_1.Uri.file(log.repoPath), { fileName: '', repoPath: log.repoPath }),
                        branch,
                        0,
                        goBackCommand
                    ]));
                }
                else {
                    items.splice(0, 0, new common_1.CommandQuickPickItem({
                        label: `$(history) Show Branch History`,
                        description: `\u00a0 \u2014 \u00a0\u00a0 shows \u00a0$(git-branch) ${branch} history`
                    }, commands_1.Commands.ShowQuickBranchHistory, [
                        new gitService_1.GitUri(vscode_1.Uri.file(log.repoPath), { fileName: '', repoPath: log.repoPath }),
                        branch,
                        undefined,
                        currentCommand
                    ]));
                }
                if (nextPageCommand) {
                    items.splice(0, 0, nextPageCommand);
                }
                if (log.truncated) {
                    const npc = new common_1.CommandQuickPickItem({
                        label: `$(arrow-right) Show Next Commits`,
                        description: `\u00a0 \u2014 \u00a0\u00a0 shows ${log.maxCount} newer commits`
                    }, commands_1.Commands.ShowQuickBranchHistory, [uri, branch, log.maxCount, goBackCommand, undefined, nextPageCommand]);
                    const last = system_1.Iterables.last(log.commits.values());
                    previousPageCommand = new common_1.CommandQuickPickItem({
                        label: `$(arrow-left) Show Previous Commits`,
                        description: `\u00a0 \u2014 \u00a0\u00a0 shows ${log.maxCount} older commits`
                    }, commands_1.Commands.ShowQuickBranchHistory, [new gitService_1.GitUri(uri ? uri : last.uri, last), branch, log.maxCount, goBackCommand, undefined, npc]);
                    items.splice(0, 0, previousPageCommand);
                }
            }
            if (goBackCommand) {
                items.splice(0, 0, goBackCommand);
            }
            if (progressCancellation.token.isCancellationRequested)
                return undefined;
            const scope = yield commands_1.Keyboard.instance.beginScope({
                left: goBackCommand,
                ',': previousPageCommand,
                '.': nextPageCommand
            });
            progressCancellation.cancel();
            const pick = yield vscode_1.window.showQuickPick(items, {
                matchOnDescription: true,
                matchOnDetail: true,
                placeHolder: `${branch} history \u2014 search by commit message, filename, or commit id`,
                ignoreFocusOut: common_1.getQuickPickIgnoreFocusOut()
            });
            yield scope.dispose();
            return pick;
        });
    }
}
exports.BranchHistoryQuickPick = BranchHistoryQuickPick;
//# sourceMappingURL=branchHistory.js.map