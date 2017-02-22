'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const vscode_1 = require("vscode");
const commands_1 = require("./commands");
const constants_1 = require("../constants");
const gitProvider_1 = require("../gitProvider");
const logger_1 = require("../logger");
class DiffLineWithWorkingCommand extends commands_1.EditorCommand {
    constructor(git) {
        super(constants_1.Commands.DiffLineWithWorking);
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
                const blameline = line - gitUri.offset;
                if (blameline < 0)
                    return undefined;
                try {
                    const blame = yield this.git.getBlameForLine(gitUri.fsPath, blameline, gitUri.sha, gitUri.repoPath);
                    if (!blame)
                        return vscode_1.window.showWarningMessage(`Unable to open diff. File is probably not under source control`);
                    commit = blame.commit;
                    if (commit.isUncommitted) {
                        commit = new gitProvider_1.GitCommit(commit.repoPath, commit.previousSha, commit.previousFileName, commit.author, commit.date, commit.message);
                        line = blame.line.line + 1 + gitUri.offset;
                    }
                }
                catch (ex) {
                    logger_1.Logger.error('[GitLens.DiffLineWithWorkingCommand]', `getBlameForLine(${blameline})`, ex);
                    return vscode_1.window.showErrorMessage(`Unable to open diff. See output channel for more details`);
                }
            }
            return vscode_1.commands.executeCommand(constants_1.Commands.DiffWithWorking, uri, commit, line);
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DiffLineWithWorkingCommand;
//# sourceMappingURL=diffLineWithWorking.js.map