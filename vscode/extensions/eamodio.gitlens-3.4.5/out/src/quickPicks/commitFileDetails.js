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
const moment = require("moment");
const path = require("path");
class OpenCommitFileCommandQuickPickItem extends common_1.OpenFileCommandQuickPickItem {
    constructor(commit, item) {
        const uri = gitService_1.GitService.toGitContentUri(commit);
        super(uri, item || {
            label: `$(file-symlink-file) Open File`,
            description: `\u00a0 \u2014 \u00a0\u00a0 ${path.basename(commit.fileName)} in \u00a0$(git-commit) ${commit.shortSha}`
        });
    }
}
exports.OpenCommitFileCommandQuickPickItem = OpenCommitFileCommandQuickPickItem;
class OpenCommitWorkingTreeFileCommandQuickPickItem extends common_1.OpenFileCommandQuickPickItem {
    constructor(commit, item) {
        const uri = vscode_1.Uri.file(path.resolve(commit.repoPath, commit.fileName));
        super(uri, item || {
            label: `$(file-symlink-file) Open Working File`,
            description: `\u00a0 \u2014 \u00a0\u00a0 ${path.basename(commit.fileName)}`
        });
    }
}
exports.OpenCommitWorkingTreeFileCommandQuickPickItem = OpenCommitWorkingTreeFileCommandQuickPickItem;
class CommitFileDetailsQuickPick {
    static show(git, commit, uri, goBackCommand, currentCommand, fileLog) {
        return __awaiter(this, void 0, void 0, function* () {
            const items = [];
            const stash = commit.type === 'stash';
            const workingName = (commit.workingFileName && path.basename(commit.workingFileName)) || path.basename(commit.fileName);
            const isUncommitted = commit.isUncommitted;
            if (isUncommitted) {
                commit = yield git.getLogCommit(undefined, commit.uri.fsPath, { previous: true });
                if (!commit)
                    return undefined;
            }
            if (!stash) {
                items.push(new common_1.CommandQuickPickItem({
                    label: `$(git-commit) Show Commit Details`,
                    description: `\u00a0 \u2014 \u00a0\u00a0 $(git-commit) ${commit.shortSha}`
                }, commands_1.Commands.ShowQuickCommitDetails, [new gitService_1.GitUri(commit.uri, commit), commit.sha, commit, currentCommand]));
                if (commit.previousSha) {
                    items.push(new common_1.CommandQuickPickItem({
                        label: `$(git-compare) Compare with Previous Commit`,
                        description: `\u00a0 \u2014 \u00a0\u00a0 $(git-commit) ${commit.previousShortSha} \u00a0 $(git-compare) \u00a0 $(git-commit) ${commit.shortSha}`
                    }, commands_1.Commands.DiffWithPrevious, [commit.uri, commit]));
                }
            }
            if (commit.workingFileName) {
                items.push(new common_1.CommandQuickPickItem({
                    label: `$(git-compare) Compare with Working Tree`,
                    description: `\u00a0 \u2014 \u00a0\u00a0 $(git-commit) ${commit.shortSha} \u00a0 $(git-compare) \u00a0 $(file-text) ${workingName}`
                }, commands_1.Commands.DiffWithWorking, [vscode_1.Uri.file(path.resolve(commit.repoPath, commit.workingFileName)), commit]));
            }
            if (!stash) {
                items.push(new common_1.CommandQuickPickItem({
                    label: `$(clippy) Copy Commit ID to Clipboard`,
                    description: `\u00a0 \u2014 \u00a0\u00a0 ${commit.shortSha}`
                }, commands_1.Commands.CopyShaToClipboard, [uri, commit.sha]));
                items.push(new common_1.CommandQuickPickItem({
                    label: `$(clippy) Copy Message to Clipboard`,
                    description: `\u00a0 \u2014 \u00a0\u00a0 ${commit.message}`
                }, commands_1.Commands.CopyMessageToClipboard, [uri, commit.sha, commit.message]));
            }
            items.push(new OpenCommitFileCommandQuickPickItem(commit));
            if (commit.workingFileName) {
                items.push(new OpenCommitWorkingTreeFileCommandQuickPickItem(commit));
            }
            const remotes = system_1.Arrays.uniqueBy(yield git.getRemotes(commit.repoPath), _ => _.url, _ => !!_.provider);
            if (remotes.length) {
                if (!stash) {
                    items.push(new remotes_1.OpenRemotesCommandQuickPickItem(remotes, 'file', commit.fileName, undefined, commit.sha, currentCommand));
                }
                if (commit.workingFileName) {
                    const branch = yield git.getBranch(commit.repoPath || git.repoPath);
                    items.push(new remotes_1.OpenRemotesCommandQuickPickItem(remotes, 'working-file', commit.workingFileName, branch.name, undefined, currentCommand));
                }
            }
            if (commit.workingFileName) {
                items.push(new common_1.CommandQuickPickItem({
                    label: `$(history) Show File History`,
                    description: `\u00a0 \u2014 \u00a0\u00a0 of ${path.basename(commit.fileName)}`
                }, commands_1.Commands.ShowQuickFileHistory, [vscode_1.Uri.file(path.resolve(commit.repoPath, commit.workingFileName)), undefined, undefined, currentCommand, fileLog]));
            }
            if (!stash) {
                items.push(new common_1.CommandQuickPickItem({
                    label: `$(history) Show ${commit.workingFileName ? 'Previous ' : ''}File History`,
                    description: `\u00a0 \u2014 \u00a0\u00a0 of ${path.basename(commit.fileName)} \u00a0\u2022\u00a0 from \u00a0$(git-commit) ${commit.shortSha}`
                }, commands_1.Commands.ShowQuickFileHistory, [new gitService_1.GitUri(commit.uri, commit), undefined, undefined, currentCommand]));
            }
            if (goBackCommand) {
                items.splice(0, 0, goBackCommand);
            }
            let previousCommand;
            let nextCommand;
            if (!stash) {
                if (fileLog && !fileLog.truncated && !fileLog.sha) {
                    previousCommand = commit.previousSha && new common_1.KeyCommandQuickPickItem(commands_1.Commands.ShowQuickCommitFileDetails, [commit.previousUri, commit.previousSha, undefined, goBackCommand, fileLog]);
                    nextCommand = commit.nextSha && new common_1.KeyCommandQuickPickItem(commands_1.Commands.ShowQuickCommitFileDetails, [commit.nextUri, commit.nextSha, undefined, goBackCommand, fileLog]);
                }
                else {
                    previousCommand = () => __awaiter(this, void 0, void 0, function* () {
                        let log = fileLog;
                        let c = log && log.commits.get(commit.sha);
                        if (!c || !c.previousSha) {
                            log = yield git.getLogForFile(commit.repoPath, uri.fsPath, commit.sha, git.config.advanced.maxQuickHistory);
                            c = log && log.commits.get(commit.sha);
                            if (!c && commit.isMerge) {
                                c = system_1.Iterables.first(log.commits.values());
                            }
                            if (c) {
                                c.nextSha = commit.nextSha;
                                c.nextFileName = commit.nextFileName;
                            }
                        }
                        if (!c || !c.previousSha)
                            return commands_1.KeyNoopCommand;
                        return new common_1.KeyCommandQuickPickItem(commands_1.Commands.ShowQuickCommitFileDetails, [c.previousUri, c.previousSha, undefined, goBackCommand, log]);
                    });
                    nextCommand = () => __awaiter(this, void 0, void 0, function* () {
                        let log = fileLog;
                        let c = log && log.commits.get(commit.sha);
                        if (!c || !c.nextSha) {
                            log = undefined;
                            c = undefined;
                            const next = yield git.findNextCommit(commit.repoPath, uri.fsPath, commit.sha);
                            if (next && next.sha !== commit.sha) {
                                c = commit;
                                c.nextSha = next.sha;
                                c.nextFileName = next.originalFileName || next.fileName;
                            }
                        }
                        if (!c || !c.nextSha)
                            return commands_1.KeyNoopCommand;
                        return new common_1.KeyCommandQuickPickItem(commands_1.Commands.ShowQuickCommitFileDetails, [c.nextUri, c.nextSha, undefined, goBackCommand, log]);
                    });
                }
            }
            const scope = yield commands_1.Keyboard.instance.beginScope({
                left: goBackCommand,
                ',': previousCommand,
                '.': nextCommand
            });
            const pick = yield vscode_1.window.showQuickPick(items, {
                matchOnDescription: true,
                placeHolder: `${commit.getFormattedPath()} \u00a0\u2022\u00a0 ${isUncommitted ? 'Uncommitted \u21E8 ' : ''}${commit.shortSha} \u00a0\u2022\u00a0 ${commit.author}, ${moment(commit.date).fromNow()} \u00a0\u2022\u00a0 ${commit.message}`,
                ignoreFocusOut: common_1.getQuickPickIgnoreFocusOut(),
                onDidSelectItem: (item) => {
                    scope.setKeyCommand('right', item);
                }
            });
            yield scope.dispose();
            return pick;
        });
    }
}
exports.CommitFileDetailsQuickPick = CommitFileDetailsQuickPick;
//# sourceMappingURL=commitFileDetails.js.map