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
const moment = require("moment");
const path = require("path");
class DiffWithPreviousCommand extends commands_1.EditorCommand {
    constructor(git) {
        super(constants_1.Commands.DiffWithPrevious);
        this.git = git;
    }
    execute(editor, edit, uri, commit, rangeOrLine) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(uri instanceof vscode_1.Uri)) {
                if (!editor.document)
                    return undefined;
                uri = editor.document.uri;
            }
            let line = editor.selection.active.line;
            if (typeof rangeOrLine === 'number') {
                line = rangeOrLine || line;
            }
            if (!commit || rangeOrLine instanceof vscode_1.Range) {
                const gitUri = gitProvider_1.GitUri.fromUri(uri, this.git);
                try {
                    const log = yield this.git.getLogForFile(gitUri.fsPath, gitUri.sha, gitUri.repoPath, rangeOrLine);
                    if (!log)
                        return vscode_1.window.showWarningMessage(`Unable to open diff. File is probably not under source control`);
                    const sha = (commit && commit.sha) || gitUri.sha;
                    commit = (sha && log.commits.get(sha)) || system_1.Iterables.first(log.commits.values());
                }
                catch (ex) {
                    logger_1.Logger.error('[GitLens.DiffWithPreviousCommand]', `getLogForFile(${gitUri.fsPath})`, ex);
                    return vscode_1.window.showErrorMessage(`Unable to open diff. See output channel for more details`);
                }
            }
            if (!commit.previousSha) {
                return vscode_1.window.showInformationMessage(`Commit ${commit.sha} (${commit.author}, ${moment(commit.date).fromNow()}) has no previous commit`);
            }
            try {
                const values = yield Promise.all([
                    this.git.getVersionedFile(commit.uri.fsPath, commit.repoPath, commit.sha),
                    this.git.getVersionedFile(commit.previousUri.fsPath, commit.repoPath, commit.previousSha)
                ]);
                yield vscode_1.commands.executeCommand(constants_1.BuiltInCommands.Diff, vscode_1.Uri.file(values[1]), vscode_1.Uri.file(values[0]), `${path.basename(commit.previousUri.fsPath)} (${commit.previousSha}) ↔ ${path.basename(commit.uri.fsPath)} (${commit.sha})`);
                return yield vscode_1.commands.executeCommand(constants_1.BuiltInCommands.RevealLine, { lineNumber: line, at: 'center' });
            }
            catch (ex) {
                logger_1.Logger.error('[GitLens.DiffWithPreviousCommand]', 'getVersionedFile', ex);
                return vscode_1.window.showErrorMessage(`Unable to open diff. See output channel for more details`);
            }
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DiffWithPreviousCommand;
//# sourceMappingURL=diffWithPrevious.js.map