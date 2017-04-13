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
const logger_1 = require("../logger");
class OpenChangedFilesCommand extends common_1.ActiveEditorCommand {
    constructor(git) {
        super(common_1.Commands.OpenChangedFiles);
        this.git = git;
    }
    execute(editor, uri, uris) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(uri instanceof vscode_1.Uri)) {
                uri = editor && editor.document && editor.document.uri;
            }
            try {
                if (!uris) {
                    const repoPath = yield this.git.getRepoPathFromUri(uri);
                    if (!repoPath)
                        return vscode_1.window.showWarningMessage(`Unable to open changed files`);
                    const status = yield this.git.getStatusForRepo(repoPath);
                    if (!status)
                        return vscode_1.window.showWarningMessage(`Unable to open changed files`);
                    uris = status.files.filter(_ => _.status !== 'D').map(_ => _.Uri);
                }
                for (const uri of uris) {
                    yield common_1.openEditor(uri, true);
                }
                return undefined;
            }
            catch (ex) {
                logger_1.Logger.error(ex, 'OpenChangedFilesCommand');
                return vscode_1.window.showErrorMessage(`Unable to open changed files. See output channel for more details`);
            }
        });
    }
}
exports.OpenChangedFilesCommand = OpenChangedFilesCommand;
//# sourceMappingURL=openChangedFiles.js.map