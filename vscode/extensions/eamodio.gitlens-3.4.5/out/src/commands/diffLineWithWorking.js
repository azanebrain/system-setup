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
class DiffLineWithWorkingCommand extends common_1.ActiveEditorCommand {
    constructor(git) {
        super(common_1.Commands.DiffLineWithWorking);
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
                    if (commit.isUncommitted) {
                        commit = new gitService_1.GitCommit(commit.type, commit.repoPath, commit.previousSha, commit.previousFileName, commit.author, commit.date, commit.message);
                        line = blame.line.line + 1 + gitUri.offset;
                    }
                }
                catch (ex) {
                    logger_1.Logger.error(ex, 'DiffLineWithWorkingCommand', `getBlameForLine(${blameline})`);
                    return vscode_1.window.showErrorMessage(`Unable to open compare. See output channel for more details`);
                }
            }
            return vscode_1.commands.executeCommand(common_1.Commands.DiffWithWorking, uri, commit, line);
        });
    }
}
exports.DiffLineWithWorkingCommand = DiffLineWithWorkingCommand;
//# sourceMappingURL=diffLineWithWorking.js.map