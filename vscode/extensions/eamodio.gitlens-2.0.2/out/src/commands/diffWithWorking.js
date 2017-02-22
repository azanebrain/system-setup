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
const path = require("path");
class DiffWithWorkingCommand extends commands_1.EditorCommand {
    constructor(git) {
        super(constants_1.Commands.DiffWithWorking);
        this.git = git;
    }
    execute(editor, edit, uri, commit, line) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(uri instanceof vscode_1.Uri)) {
                if (!editor.document)
                    return undefined;
                uri = editor.document.uri;
            }
            line = line || editor.selection.active.line;
            if (!commit || gitProvider_1.default.isUncommitted(commit.sha)) {
                const gitUri = gitProvider_1.GitUri.fromUri(uri, this.git);
                try {
                    const log = yield this.git.getLogForFile(gitUri.fsPath, gitUri.sha, gitUri.repoPath);
                    if (!log)
                        return vscode_1.window.showWarningMessage(`Unable to open diff. File is probably not under source control`);
                    commit = (gitUri.sha && log.commits.get(gitUri.sha)) || system_1.Iterables.first(log.commits.values());
                }
                catch (ex) {
                    logger_1.Logger.error('[GitLens.DiffWithWorkingCommand]', `getLogForFile(${gitUri.fsPath})`, ex);
                    return vscode_1.window.showErrorMessage(`Unable to open diff. See output channel for more details`);
                }
            }
            const gitUri = gitProvider_1.GitUri.fromUri(uri, this.git);
            try {
                const compare = yield this.git.getVersionedFile(commit.uri.fsPath, commit.repoPath, commit.sha);
                yield vscode_1.commands.executeCommand(constants_1.BuiltInCommands.Diff, vscode_1.Uri.file(compare), gitUri.fileUri(), `${path.basename(commit.uri.fsPath)} (${commit.sha}) ↔ ${path.basename(gitUri.fsPath)}`);
                return yield vscode_1.commands.executeCommand(constants_1.BuiltInCommands.RevealLine, { lineNumber: line, at: 'center' });
            }
            catch (ex) {
                logger_1.Logger.error('[GitLens.DiffWithWorkingCommand]', 'getVersionedFile', ex);
                return vscode_1.window.showErrorMessage(`Unable to open diff. See output channel for more details`);
            }
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DiffWithWorkingCommand;
//# sourceMappingURL=diffWithWorking.js.map