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
const commands_1 = require("../commands");
const common_1 = require("./common");
const gitService_1 = require("../gitService");
const path = require("path");
class OpenRemoteCommandQuickPickItem extends common_1.CommandQuickPickItem {
    constructor(remote, type, ...args) {
        super({
            label: `$(link-external) Open ${gitService_1.getNameFromRemoteOpenType(type)} in ${remote.provider.name}`,
            description: `\u00a0 \u2014 \u00a0\u00a0 $(repo) ${remote.provider.path}`
        }, undefined, undefined);
        this.remote = remote;
        this.type = type;
        this.args = args;
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.remote.provider.open(this.type, ...this.args);
        });
    }
}
exports.OpenRemoteCommandQuickPickItem = OpenRemoteCommandQuickPickItem;
class OpenRemotesCommandQuickPickItem extends common_1.CommandQuickPickItem {
    constructor(remotes, type, branchOrShaOrFileName, goBackCommandOrFileBranch, fileSha, goBackCommand) {
        let fileBranch;
        if (typeof goBackCommandOrFileBranch === 'string') {
            fileBranch = goBackCommandOrFileBranch;
        }
        else if (!goBackCommand) {
            goBackCommand = goBackCommandOrFileBranch;
        }
        const name = gitService_1.getNameFromRemoteOpenType(type);
        let description;
        let placeHolder;
        switch (type) {
            case 'branch':
                description = `$(git-branch) ${branchOrShaOrFileName}`;
                placeHolder = `open ${branchOrShaOrFileName} ${name.toLowerCase()} in\u2026`;
                break;
            case 'commit':
                const shortSha = branchOrShaOrFileName.substring(0, 8);
                description = `$(git-commit) ${shortSha}`;
                placeHolder = `open ${name.toLowerCase()} ${shortSha} in\u2026`;
                break;
            case 'file':
            case 'working-file':
                const fileName = path.basename(branchOrShaOrFileName);
                const shortFileSha = (fileSha && fileSha.substring(0, 8)) || '';
                const shaSuffix = shortFileSha ? ` \u00a0\u2022\u00a0 ${shortFileSha}` : '';
                description = `$(file-text) ${fileName}${shortFileSha ? ` in \u00a0$(git-commit) ${shortFileSha}` : ''}`;
                placeHolder = `open ${branchOrShaOrFileName}${shaSuffix} in\u2026`;
                break;
        }
        const remote = remotes[0];
        if (remotes.length === 1) {
            super({
                label: `$(link-external) Open ${name} in ${remote.provider.name}`,
                description: `\u00a0 \u2014 \u00a0\u00a0 $(repo) ${remote.provider.path} \u00a0\u2022\u00a0 ${description}`
            }, commands_1.Commands.OpenInRemote, [undefined, remotes, type, [branchOrShaOrFileName, fileBranch, fileSha], goBackCommand]);
            return;
        }
        const provider = remotes.every(_ => _.provider.name === remote.provider.name)
            ? remote.provider.name
            : 'Remote';
        super({
            label: `$(link-external) Open ${name} in ${provider}\u2026`,
            description: `\u00a0 \u2014 \u00a0\u00a0 ${description}`
        }, commands_1.Commands.OpenInRemote, [undefined, remotes, type, [branchOrShaOrFileName, fileBranch, fileSha], goBackCommand]);
    }
}
exports.OpenRemotesCommandQuickPickItem = OpenRemotesCommandQuickPickItem;
class RemotesQuickPick {
    static show(remotes, placeHolder, type, args, goBackCommand) {
        return __awaiter(this, void 0, void 0, function* () {
            const items = remotes.map(_ => new OpenRemoteCommandQuickPickItem(_, type, ...args));
            if (goBackCommand) {
                items.splice(0, 0, goBackCommand);
            }
            const pick = yield vscode_1.window.showQuickPick(items, {
                placeHolder: placeHolder,
                ignoreFocusOut: common_1.getQuickPickIgnoreFocusOut()
            });
            if (!pick)
                return undefined;
            return pick;
        });
    }
}
exports.RemotesQuickPick = RemotesQuickPick;
//# sourceMappingURL=remotes.js.map