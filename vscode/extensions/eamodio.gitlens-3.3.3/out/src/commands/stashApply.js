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
const quickPicks_1 = require("../quickPicks");
const logger_1 = require("../logger");
const quickPicks_2 = require("../quickPicks");
class StashApplyCommand extends common_1.Command {
    constructor(git) {
        super(common_1.Commands.StashApply);
        this.git = git;
    }
    execute(stashItem, confirm = true, deleteAfter = false, goBackCommand) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.git.config.insiders)
                return undefined;
            if (!this.git.repoPath)
                return undefined;
            if (!stashItem || !stashItem.stashName) {
                const stash = yield this.git.getStashList(this.git.repoPath);
                if (!stash)
                    return vscode_1.window.showInformationMessage(`There are no stashed changes`);
                const currentCommand = new quickPicks_2.CommandQuickPickItem({
                    label: `go back \u21A9`,
                    description: `\u00a0 \u2014 \u00a0\u00a0 to apply stashed changes`
                }, common_1.Commands.StashApply, [stashItem, confirm, deleteAfter, goBackCommand]);
                const pick = yield quickPicks_1.StashListQuickPick.show(this.git, stash, 'apply', goBackCommand, currentCommand);
                if (!pick || !(pick instanceof quickPicks_1.CommitQuickPickItem))
                    return goBackCommand && goBackCommand.execute();
                goBackCommand = currentCommand;
                stashItem = pick.commit;
            }
            try {
                if (confirm) {
                    const message = stashItem.message.length > 80 ? `${stashItem.message.substring(0, 80)}\u2026` : stashItem.message;
                    const result = yield vscode_1.window.showWarningMessage(`Apply stashed changes '${message}' to your working tree?`, { title: 'Yes, delete after applying' }, { title: 'Yes' }, { title: 'No', isCloseAffordance: true });
                    if (!result || result.title === 'No')
                        return goBackCommand && goBackCommand.execute();
                    deleteAfter = result.title !== 'Yes';
                }
                return yield this.git.stashApply(this.git.repoPath, stashItem.stashName, deleteAfter);
            }
            catch (ex) {
                logger_1.Logger.error(ex, 'StashApplyCommand');
                if (ex.message.includes('Your local changes to the following files would be overwritten by merge')) {
                    return vscode_1.window.showErrorMessage(`Unable to apply stash. Your working tree changes would be overwritten.`);
                }
                else {
                    return vscode_1.window.showErrorMessage(`Unable to apply stash. See output channel for more details`);
                }
            }
        });
    }
}
exports.StashApplyCommand = StashApplyCommand;
//# sourceMappingURL=stashApply.js.map