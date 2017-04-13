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
class OpenInRemoteCommand extends common_1.ActiveEditorCommand {
    constructor() {
        super(common_1.Commands.OpenInRemote);
    }
    execute(editor, uri, remotes, type, args, goBackCommand) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(uri instanceof vscode_1.Uri)) {
                uri = editor && editor.document && editor.document.uri;
            }
            try {
                if (!remotes)
                    return undefined;
                if (remotes.length === 1) {
                    const command = new quickPicks_1.OpenRemoteCommandQuickPickItem(remotes[0], type, ...args);
                    return command.execute();
                }
                let placeHolder;
                switch (type) {
                    case 'branch':
                        placeHolder = `open ${args[0]} branch in\u2026`;
                        break;
                    case 'commit':
                        const shortSha = args[0].substring(0, 8);
                        placeHolder = `open commit ${shortSha} in\u2026`;
                        break;
                    case 'file':
                    case 'working-file':
                        const shortFileSha = (args[2] && args[2].substring(0, 8)) || '';
                        const shaSuffix = shortFileSha ? ` \u00a0\u2022\u00a0 ${shortFileSha}` : '';
                        placeHolder = `open ${args[0]}${shaSuffix} in\u2026`;
                        break;
                }
                const pick = yield quickPicks_1.RemotesQuickPick.show(remotes, placeHolder, type, args, goBackCommand);
                return pick && pick.execute();
            }
            catch (ex) {
                logger_1.Logger.error(ex, 'OpenInRemoteCommand');
                return vscode_1.window.showErrorMessage(`Unable to open in remote provider. See output channel for more details`);
            }
        });
    }
}
exports.OpenInRemoteCommand = OpenInRemoteCommand;
//# sourceMappingURL=openInRemote.js.map