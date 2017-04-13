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
const commands_1 = require("../commands");
const quickPicks_1 = require("../quickPicks");
class StashListQuickPick {
    static show(git, stash, mode, goBackCommand, currentCommand) {
        return __awaiter(this, void 0, void 0, function* () {
            const items = ((stash && Array.from(system_1.Iterables.map(stash.commits.values(), c => new quickPicks_1.CommitQuickPickItem(c)))) || []);
            if (mode === 'list' && git.config.insiders) {
                items.splice(0, 0, new quickPicks_1.CommandQuickPickItem({
                    label: `$(repo-push) Stash Unstaged Changes`,
                    description: `\u00a0 \u2014 \u00a0\u00a0 stashes only unstaged changes`
                }, commands_1.Commands.StashSave, [undefined, true, currentCommand]));
                items.splice(0, 0, new quickPicks_1.CommandQuickPickItem({
                    label: `$(repo-push) Stash Changes`,
                    description: `\u00a0 \u2014 \u00a0\u00a0 stashes all changes`
                }, commands_1.Commands.StashSave, [undefined, undefined, currentCommand]));
            }
            if (goBackCommand) {
                items.splice(0, 0, goBackCommand);
            }
            const scope = yield commands_1.Keyboard.instance.beginScope({ left: goBackCommand });
            const pick = yield vscode_1.window.showQuickPick(items, {
                matchOnDescription: true,
                placeHolder: mode === 'apply'
                    ? `Apply stashed changes to your working tree\u2026`
                    : `stashed changes \u2014 search by message, filename, or commit id`,
                ignoreFocusOut: quickPicks_1.getQuickPickIgnoreFocusOut()
            });
            yield scope.dispose();
            return pick;
        });
    }
}
exports.StashListQuickPick = StashListQuickPick;
//# sourceMappingURL=stashList.js.map