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
const gitService_1 = require("../gitService");
const moment = require("moment");
function getQuickPickIgnoreFocusOut() {
    return !vscode_1.workspace.getConfiguration('gitlens').get('advanced').quickPick.closeOnFocusOut;
}
exports.getQuickPickIgnoreFocusOut = getQuickPickIgnoreFocusOut;
function showQuickPickProgress(message, mapping, delay = false) {
    const cancellation = new vscode_1.CancellationTokenSource();
    if (delay) {
        let disposable;
        const timer = setTimeout(() => {
            disposable && disposable.dispose();
            _showQuickPickProgress(message, cancellation, mapping);
        }, 250);
        disposable = cancellation.token.onCancellationRequested(() => clearTimeout(timer));
    }
    else {
        _showQuickPickProgress(message, cancellation, mapping);
    }
    return cancellation;
}
exports.showQuickPickProgress = showQuickPickProgress;
function _showQuickPickProgress(message, cancellation, mapping) {
    return __awaiter(this, void 0, void 0, function* () {
        const scope = mapping && (yield commands_1.Keyboard.instance.beginScope(mapping));
        try {
            yield vscode_1.window.showQuickPick(_getInfiniteCancellablePromise(cancellation), {
                placeHolder: message,
                ignoreFocusOut: getQuickPickIgnoreFocusOut()
            }, cancellation.token);
        }
        catch (ex) {
        }
        finally {
            cancellation.cancel();
            scope && scope.dispose();
        }
    });
}
function _getInfiniteCancellablePromise(cancellation) {
    return new Promise((resolve, reject) => {
        const disposable = cancellation.token.onCancellationRequested(() => {
            disposable.dispose();
            resolve([]);
        });
    });
}
class CommandQuickPickItem {
    constructor(item, command, args) {
        this.command = command;
        this.args = args;
        Object.assign(this, item);
    }
    execute() {
        return vscode_1.commands.executeCommand(this.command, ...(this.args || []));
    }
}
exports.CommandQuickPickItem = CommandQuickPickItem;
class KeyCommandQuickPickItem extends CommandQuickPickItem {
    constructor(command, args) {
        super({ label: undefined, description: undefined }, command, args);
        this.command = command;
        this.args = args;
    }
}
exports.KeyCommandQuickPickItem = KeyCommandQuickPickItem;
class OpenFileCommandQuickPickItem extends CommandQuickPickItem {
    constructor(uri, item) {
        super(item, undefined, undefined);
        this.uri = uri;
    }
    execute(pinned = false) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.open(pinned);
        });
    }
    open(pinned = false) {
        return __awaiter(this, void 0, void 0, function* () {
            return commands_1.openEditor(this.uri, pinned);
        });
    }
}
exports.OpenFileCommandQuickPickItem = OpenFileCommandQuickPickItem;
class OpenFilesCommandQuickPickItem extends CommandQuickPickItem {
    constructor(uris, item) {
        super(item, undefined, undefined);
        this.uris = uris;
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            for (const uri of this.uris) {
                yield commands_1.openEditor(uri, true);
            }
            return undefined;
        });
    }
}
exports.OpenFilesCommandQuickPickItem = OpenFilesCommandQuickPickItem;
class CommitQuickPickItem {
    constructor(commit) {
        this.commit = commit;
        let message = commit.message;
        const index = message.indexOf('\n');
        if (index !== -1) {
            message = `${message.substring(0, index)}\u00a0$(ellipsis)`;
        }
        if (commit instanceof gitService_1.GitStashCommit) {
            this.label = `${commit.stashName}\u00a0\u2022\u00a0${message}`;
            this.description = null;
            this.detail = `\u00a0 ${moment(commit.date).fromNow()}\u00a0\u00a0\u2022\u00a0 ${commit.getDiffStatus()}`;
        }
        else {
            this.label = message;
            this.description = `\u00a0$(git-commit)\u00a0 ${commit.shortSha}`;
            this.detail = `\u00a0 ${commit.author}, ${moment(commit.date).fromNow()}${(commit.type === 'branch') ? `\u00a0\u00a0\u2022\u00a0 ${commit.getDiffStatus()}` : ''}`;
        }
    }
}
exports.CommitQuickPickItem = CommitQuickPickItem;
//# sourceMappingURL=common.js.map