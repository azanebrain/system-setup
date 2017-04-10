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
const quickPicks_1 = require("../quickPicks");
class ShowQuickRepoStatusCommand extends common_1.ActiveEditorCachedCommand {
    constructor(git) {
        super(common_1.Commands.ShowQuickRepoStatus);
        this.git = git;
    }
    execute(editor, uri, goBackCommand) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(uri instanceof vscode_1.Uri)) {
                uri = editor && editor.document && editor.document.uri;
            }
            try {
                const repoPath = yield this.git.getRepoPathFromUri(uri);
                if (!repoPath)
                    return vscode_1.window.showWarningMessage(`Unable to show repository status`);
                const status = yield this.git.getStatusForRepo(repoPath);
                if (!status)
                    return vscode_1.window.showWarningMessage(`Unable to show repository status`);
                const pick = yield quickPicks_1.RepoStatusQuickPick.show(status, goBackCommand);
                if (!pick)
                    return undefined;
                if (pick instanceof quickPicks_1.CommandQuickPickItem) {
                    return pick.execute();
                }
            }
            catch (ex) {
                logger_1.Logger.error(ex, 'ShowQuickRepoStatusCommand');
                return vscode_1.window.showErrorMessage(`Unable to show repository status. See output channel for more details`);
            }
        });
    }
}
exports.ShowQuickRepoStatusCommand = ShowQuickRepoStatusCommand;
//# sourceMappingURL=showQuickRepoStatus.js.map