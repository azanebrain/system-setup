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
const common_1 = require("./common");
const constants_1 = require("../constants");
const gitService_1 = require("../gitService");
const logger_1 = require("../logger");
const moment = require("moment");
const path = require("path");
class DiffWithPreviousCommand extends common_1.ActiveEditorCommand {
    constructor(git) {
        super(common_1.Commands.DiffWithPrevious);
        this.git = git;
    }
    execute(editor, uri, commit, rangeOrLine) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(uri instanceof vscode_1.Uri)) {
                if (!editor || !editor.document)
                    return undefined;
                uri = editor.document.uri;
            }
            let line = (editor && editor.selection.active.line) || 0;
            if (typeof rangeOrLine === 'number') {
                line = rangeOrLine || line;
                rangeOrLine = undefined;
            }
            if (!commit || rangeOrLine instanceof vscode_1.Range) {
                const gitUri = yield gitService_1.GitUri.fromUri(uri, this.git);
                try {
                    if (!gitUri.sha) {
                        if (yield this.git.isFileUncommitted(gitUri)) {
                            return vscode_1.commands.executeCommand(common_1.Commands.DiffWithWorking, uri);
                        }
                    }
                    const sha = (commit && commit.sha) || gitUri.sha;
                    const log = yield this.git.getLogForFile(gitUri.repoPath, gitUri.fsPath, undefined, sha ? undefined : 2, rangeOrLine);
                    if (!log)
                        return vscode_1.window.showWarningMessage(`Unable to open compare. File is probably not under source control`);
                    commit = (sha && log.commits.get(sha)) || system_1.Iterables.first(log.commits.values());
                }
                catch (ex) {
                    logger_1.Logger.error(ex, 'DiffWithPreviousCommand', `getLogForFile(${gitUri.repoPath}, ${gitUri.fsPath})`);
                    return vscode_1.window.showErrorMessage(`Unable to open compare. See output channel for more details`);
                }
            }
            if (!commit.previousSha) {
                return vscode_1.window.showInformationMessage(`Commit ${commit.shortSha} (${commit.author}, ${moment(commit.date).fromNow()}) has no previous commit`);
            }
            try {
                const [rhs, lhs] = yield Promise.all([
                    this.git.getVersionedFile(commit.repoPath, commit.uri.fsPath, commit.sha),
                    this.git.getVersionedFile(commit.repoPath, commit.previousUri.fsPath, commit.previousSha)
                ]);
                yield vscode_1.commands.executeCommand(constants_1.BuiltInCommands.Diff, vscode_1.Uri.file(lhs), vscode_1.Uri.file(rhs), `${path.basename(commit.previousUri.fsPath)} (${commit.previousShortSha}) ↔ ${path.basename(commit.uri.fsPath)} (${commit.shortSha})`);
                return yield vscode_1.commands.executeCommand(constants_1.BuiltInCommands.RevealLine, { lineNumber: line, at: 'center' });
            }
            catch (ex) {
                logger_1.Logger.error(ex, 'DiffWithPreviousCommand', 'getVersionedFile');
                return vscode_1.window.showErrorMessage(`Unable to open compare. See output channel for more details`);
            }
        });
    }
}
exports.DiffWithPreviousCommand = DiffWithPreviousCommand;
//# sourceMappingURL=diffWithPrevious.js.map