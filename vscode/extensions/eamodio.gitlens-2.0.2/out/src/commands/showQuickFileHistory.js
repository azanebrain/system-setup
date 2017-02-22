'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const system_1 = require("../system");
const vscode_1 = require("vscode");
const commands_1 = require("./commands");
const constants_1 = require("../constants");
const gitProvider_1 = require("../gitProvider");
const logger_1 = require("../logger");
const quickPickItems_1 = require("./quickPickItems");
const moment = require("moment");
class ShowQuickFileHistoryCommand extends commands_1.EditorCommand {
    constructor(git) {
        super(constants_1.Commands.ShowQuickFileHistory);
        this.git = git;
    }
    execute(editor, edit, uri, maxCount) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(uri instanceof vscode_1.Uri)) {
                if (!editor.document)
                    return undefined;
                uri = editor.document.uri;
            }
            const gitUri = gitProvider_1.GitUri.fromUri(uri, this.git);
            if (maxCount == null) {
                maxCount = this.git.config.advanced.maxQuickHistory;
            }
            try {
                const log = yield this.git.getLogForFile(gitUri.fsPath, gitUri.sha, gitUri.repoPath, undefined, maxCount);
                if (!log)
                    return vscode_1.window.showWarningMessage(`Unable to show file history. File is probably not under source control`);
                const commits = Array.from(system_1.Iterables.map(log.commits.values(), c => new quickPickItems_1.CommitQuickPickItem(c)));
                let placeHolderSuffix = '';
                if (maxCount !== 0 && commits.length === this.git.config.advanced.maxQuickHistory) {
                    placeHolderSuffix = ` \u2014 Only showing the first ${this.git.config.advanced.maxQuickHistory} commits`;
                    commits.push(new quickPickItems_1.ShowAllCommitsQuickPickItem(this.git.config.advanced.maxQuickHistory));
                }
                const pick = yield vscode_1.window.showQuickPick(commits, {
                    matchOnDescription: true,
                    matchOnDetail: true,
                    placeHolder: `${system_1.Iterables.first(log.commits.values()).fileName}${placeHolderSuffix}`
                });
                if (!pick)
                    return undefined;
                if (pick instanceof quickPickItems_1.ShowAllCommitsQuickPickItem) {
                    return vscode_1.commands.executeCommand(constants_1.Commands.ShowQuickFileHistory, uri, 0);
                }
                const commitPick = pick;
                const commit = commitPick.commit;
                let command = constants_1.Commands.DiffWithWorking;
                if (commit.previousSha) {
                    const items = [
                        {
                            label: `Compare with Working Tree`,
                            description: `\u2022 ${commit.sha}  $(git-compare)  ${commit.fileName}`,
                            detail: null,
                            command: constants_1.Commands.DiffWithWorking
                        },
                        {
                            label: `Compare with Previous Commit`,
                            description: `\u2022 ${commit.previousSha}  $(git-compare)  ${commit.sha}`,
                            detail: null,
                            command: constants_1.Commands.DiffWithPrevious
                        }
                    ];
                    const comparePick = yield vscode_1.window.showQuickPick(items, {
                        matchOnDescription: true,
                        placeHolder: `${commit.fileName} \u2022 ${commit.sha} \u2022 ${commit.author}, ${moment(commit.date).fromNow()}`
                    });
                    command = comparePick ? comparePick.command : undefined;
                }
                if (command) {
                    return vscode_1.commands.executeCommand(command, uri, commit);
                }
            }
            catch (ex) {
                logger_1.Logger.error('[GitLens.ShowQuickFileHistoryCommand]', 'getLogLocations', ex);
                return vscode_1.window.showErrorMessage(`Unable to show file history. See output channel for more details`);
            }
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ShowQuickFileHistoryCommand;
//# sourceMappingURL=showQuickFileHistory.js.map