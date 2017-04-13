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
const constants_1 = require("../constants");
const gitService_1 = require("../gitService");
const logger_1 = require("../logger");
const path = require("path");
class DiffLineWithPreviousCommand extends common_1.ActiveEditorCommand {
    constructor(git) {
        super(common_1.Commands.DiffLineWithPrevious);
        this.git = git;
    }
    execute(editor, uri, commit, line) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(uri instanceof vscode_1.Uri)) {
                if (!editor || !editor.document)
                    return undefined;
                uri = editor.document.uri;
            }
            const gitUri = yield gitService_1.GitUri.fromUri(uri, this.git);
            line = line || (editor && editor.selection.active.line) || gitUri.offset;
            if (!commit || gitService_1.GitService.isUncommitted(commit.sha)) {
                if (editor && editor.document && editor.document.isDirty)
                    return undefined;
                const blameline = line - gitUri.offset;
                if (blameline < 0)
                    return undefined;
                try {
                    const blame = yield this.git.getBlameForLine(gitUri, blameline);
                    if (!blame)
                        return vscode_1.window.showWarningMessage(`Unable to open compare. File is probably not under source control`);
                    commit = blame.commit;
                    if (!gitUri.sha || gitUri.sha === commit.sha) {
                        return vscode_1.commands.executeCommand(common_1.Commands.DiffWithPrevious, new gitService_1.GitUri(uri, commit), undefined, line);
                    }
                    if (commit.isUncommitted) {
                        uri = commit.uri;
                        commit = new gitService_1.GitCommit(commit.type, commit.repoPath, commit.previousSha, commit.previousFileName, commit.author, commit.date, commit.message);
                        line = (blame.line.line + 1) + gitUri.offset;
                        return vscode_1.commands.executeCommand(common_1.Commands.DiffWithWorking, uri, commit, line);
                    }
                }
                catch (ex) {
                    logger_1.Logger.error(ex, 'DiffWithPreviousLineCommand', `getBlameForLine(${blameline})`);
                    return vscode_1.window.showErrorMessage(`Unable to open compare. See output channel for more details`);
                }
            }
            try {
                const [rhs, lhs] = yield Promise.all([
                    this.git.getVersionedFile(gitUri.repoPath, gitUri.fsPath, gitUri.sha),
                    this.git.getVersionedFile(commit.repoPath, commit.uri.fsPath, commit.sha)
                ]);
                yield vscode_1.commands.executeCommand(constants_1.BuiltInCommands.Diff, vscode_1.Uri.file(lhs), vscode_1.Uri.file(rhs), `${path.basename(commit.uri.fsPath)} (${commit.shortSha}) ↔ ${path.basename(gitUri.fsPath)} (${gitUri.shortSha})`);
                return yield vscode_1.commands.executeCommand(constants_1.BuiltInCommands.RevealLine, { lineNumber: line, at: 'center' });
            }
            catch (ex) {
                logger_1.Logger.error(ex, 'DiffWithPreviousLineCommand', 'getVersionedFile');
                return vscode_1.window.showErrorMessage(`Unable to open compare. See output channel for more details`);
            }
        });
    }
}
exports.DiffLineWithPreviousCommand = DiffLineWithPreviousCommand;
//# sourceMappingURL=diffLineWithPrevious.js.map