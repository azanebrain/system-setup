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
class ShowFileHistoryCommand extends common_1.EditorCommand {
    constructor(git) {
        super(common_1.Commands.ShowFileHistory);
        this.git = git;
    }
    execute(editor, edit, uri, position, sha, line) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(uri instanceof vscode_1.Uri)) {
                if (!editor.document)
                    return undefined;
                uri = editor.document.uri;
            }
            if (position == null) {
                position = editor.document.validateRange(new vscode_1.Range(0, 0, 0, 1000000)).start;
            }
            const gitUri = yield gitService_1.GitUri.fromUri(uri, this.git);
            try {
                const locations = yield this.git.getLogLocations(gitUri, sha, line);
                if (!locations)
                    return vscode_1.window.showWarningMessage(`Unable to show file history. File is probably not under source control`);
                return vscode_1.commands.executeCommand(constants_1.BuiltInCommands.ShowReferences, uri, position, locations);
            }
            catch (ex) {
                logger_1.Logger.error(ex, 'ShowFileHistoryCommand', 'getLogLocations');
                return vscode_1.window.showErrorMessage(`Unable to show file history. See output channel for more details`);
            }
        });
    }
}
exports.ShowFileHistoryCommand = ShowFileHistoryCommand;
//# sourceMappingURL=showFileHistory.js.map