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
class ShowBlameHistoryCommand extends commands_1.EditorCommand {
    constructor(git) {
        super(constants_1.Commands.ShowBlameHistory);
        this.git = git;
    }
    execute(editor, edit, uri, range, position, sha, line) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(uri instanceof vscode_1.Uri)) {
                if (!editor.document)
                    return undefined;
                uri = editor.document.uri;
            }
            if (range == null || position == null) {
                range = editor.document.validateRange(new vscode_1.Range(0, 0, 1000000, 1000000));
                position = editor.document.validateRange(new vscode_1.Range(0, 0, 0, 1000000)).start;
            }
            const gitUri = gitProvider_1.GitUri.fromUri(uri, this.git);
            try {
                const locations = yield this.git.getBlameLocations(gitUri.fsPath, range, gitUri.sha, gitUri.repoPath, sha, line);
                if (!locations)
                    return vscode_1.window.showWarningMessage(`Unable to show blame history. File is probably not under source control`);
                return vscode_1.commands.executeCommand(constants_1.BuiltInCommands.ShowReferences, uri, position, locations);
            }
            catch (ex) {
                logger_1.Logger.error('[GitLens.ShowBlameHistoryCommand]', 'getBlameLocations', ex);
                return vscode_1.window.showErrorMessage(`Unable to show blame history. See output channel for more details`);
            }
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ShowBlameHistoryCommand;
//# sourceMappingURL=showBlameHistory.js.map