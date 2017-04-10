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
class OpenFileInRemoteCommand extends common_1.ActiveEditorCommand {
    constructor(git) {
        super(common_1.Commands.OpenFileInRemote);
        this.git = git;
    }
    execute(editor, edit, uri) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(uri instanceof vscode_1.Uri)) {
                if (!editor || !editor.document)
                    return undefined;
                uri = editor.document.uri;
            }
            if (!uri)
                return undefined;
            const gitUri = yield gitService_1.GitUri.fromUri(uri, this.git);
            if (!gitUri.repoPath)
                return undefined;
            const branch = yield this.git.getBranch(gitUri.repoPath);
            try {
                const remotes = system_1.Arrays.uniqueBy(yield this.git.getRemotes(gitUri.repoPath), _ => _.url, _ => !!_.provider);
                const range = editor && new vscode_1.Range(editor.selection.start.with({ line: editor.selection.start.line + 1 }), editor.selection.end.with({ line: editor.selection.end.line + 1 }));
                return vscode_1.commands.executeCommand(common_1.Commands.OpenInRemote, uri, remotes, 'file', [gitUri.getRelativePath(), branch.name, gitUri.sha, range]);
            }
            catch (ex) {
                logger_1.Logger.error(ex, 'OpenFileInRemoteCommand');
                return vscode_1.window.showErrorMessage(`Unable to open file in remote provider. See output channel for more details`);
            }
        });
    }
}
exports.OpenFileInRemoteCommand = OpenFileInRemoteCommand;
//# sourceMappingURL=openFileInRemote.js.map