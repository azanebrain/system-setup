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
const gitService_1 = require("../gitService");
const logger_1 = require("../logger");
class OpenCommitInRemoteCommand extends common_1.ActiveEditorCommand {
    constructor(git) {
        super(common_1.Commands.OpenCommitInRemote);
        this.git = git;
    }
    execute(editor, edit, uri) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(uri instanceof vscode_1.Uri)) {
                if (!editor || !editor.document)
                    return undefined;
                uri = editor.document.uri;
            }
            if ((editor && editor.document && editor.document.isDirty) || uri)
                return undefined;
            const gitUri = yield gitService_1.GitUri.fromUri(uri, this.git);
            if (!gitUri.repoPath)
                return undefined;
            const line = (editor && editor.selection.active.line) || gitUri.offset;
            try {
                const blameline = line - gitUri.offset;
                if (blameline < 0)
                    return undefined;
                const blame = yield this.git.getBlameForLine(gitUri, blameline);
                if (!blame)
                    return vscode_1.window.showWarningMessage(`Unable to open commit in remote provider. File is probably not under source control`);
                let commit = blame.commit;
                if (commit.isUncommitted) {
                    commit = new gitService_1.GitCommit(commit.type, commit.repoPath, commit.previousSha, commit.previousFileName, commit.author, commit.date, commit.message);
                }
                const remotes = system_1.Arrays.uniqueBy(yield this.git.getRemotes(gitUri.repoPath), _ => _.url, _ => !!_.provider);
                return vscode_1.commands.executeCommand(common_1.Commands.OpenInRemote, uri, remotes, 'commit', [commit.sha]);
            }
            catch (ex) {
                logger_1.Logger.error(ex, 'OpenCommitInRemoteCommand');
                return vscode_1.window.showErrorMessage(`Unable to open commit in remote provider. See output channel for more details`);
            }
        });
    }
}
exports.OpenCommitInRemoteCommand = OpenCommitInRemoteCommand;
//# sourceMappingURL=openCommitInRemote.js.map