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
class ShowQuickRepoHistoryCommand extends commands_1.Command {
    constructor(git, repoPath) {
        super(constants_1.Commands.ShowQuickRepoHistory);
        this.git = git;
        this.repoPath = repoPath;
    }
    execute(uri, maxCount) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(uri instanceof vscode_1.Uri)) {
                const document = vscode_1.window.activeTextEditor && vscode_1.window.activeTextEditor.document;
                if (document) {
                    uri = document.uri;
                }
            }
            if (maxCount == null) {
                maxCount = this.git.config.advanced.maxQuickHistory;
            }
            try {
                let repoPath;
                if (uri instanceof vscode_1.Uri) {
                    const gitUri = gitProvider_1.GitUri.fromUri(uri, this.git);
                    repoPath = gitUri.repoPath;
                    if (!repoPath) {
                        repoPath = yield this.git.getRepoPathFromFile(gitUri.fsPath);
                    }
                }
                if (!repoPath) {
                    repoPath = this.repoPath;
                }
                if (!repoPath)
                    return vscode_1.window.showWarningMessage(`Unable to show repository history`);
                const log = yield this.git.getLogForRepo(repoPath, maxCount);
                if (!log)
                    return vscode_1.window.showWarningMessage(`Unable to show repository history`);
                const commits = Array.from(system_1.Iterables.map(log.commits.values(), c => new quickPickItems_1.CommitQuickPickItem(c, ` \u2014 ${c.fileName}`)));
                let placeHolder = '';
                if (maxCount !== 0 && commits.length === this.git.config.advanced.maxQuickHistory) {
                    placeHolder = `Only showing the first ${this.git.config.advanced.maxQuickHistory} commits`;
                    commits.push(new quickPickItems_1.ShowAllCommitsQuickPickItem(this.git.config.advanced.maxQuickHistory));
                }
                const pick = yield vscode_1.window.showQuickPick(commits, {
                    matchOnDescription: true,
                    matchOnDetail: true,
                    placeHolder: placeHolder
                });
                if (!pick)
                    return undefined;
                if (pick instanceof quickPickItems_1.ShowAllCommitsQuickPickItem) {
                    return vscode_1.commands.executeCommand(constants_1.Commands.ShowQuickRepoHistory, uri, 0);
                }
                const commitPick = pick;
                const files = commitPick.commit.fileName.split(', ').map(f => new quickPickItems_1.FileQuickPickItem(commitPick.commit, f));
                const filePick = yield vscode_1.window.showQuickPick(files, {
                    matchOnDescription: true,
                    matchOnDetail: true,
                    placeHolder: `${commitPick.commit.sha} \u2022 ${commitPick.commit.author}, ${moment(commitPick.commit.date).fromNow()}`
                });
                if (filePick) {
                    const log = yield this.git.getLogForFile(filePick.uri.fsPath);
                    if (!log)
                        return vscode_1.window.showWarningMessage(`Unable to open diff`);
                    const commit = system_1.Iterables.find(log.commits.values(), c => c.sha === commitPick.commit.sha);
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
                        return vscode_1.commands.executeCommand(command, commit.uri, commit);
                    }
                }
                return undefined;
            }
            catch (ex) {
                logger_1.Logger.error('[GitLens.ShowQuickRepoHistoryCommand]', 'getLogLocations', ex);
                return vscode_1.window.showErrorMessage(`Unable to show repository history. See output channel for more details`);
            }
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ShowQuickRepoHistoryCommand;
//# sourceMappingURL=showQuickRepoHistory.js.map