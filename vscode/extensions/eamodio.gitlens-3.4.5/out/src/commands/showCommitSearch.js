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
const gitService_1 = require("../gitService");
const logger_1 = require("../logger");
const quickPicks_1 = require("../quickPicks");
const searchByRegex = /^([@:#])/;
const searchByMap = new Map([
    ['@', gitService_1.GitRepoSearchBy.Author],
    [':', gitService_1.GitRepoSearchBy.Files],
    ['#', gitService_1.GitRepoSearchBy.Sha]
]);
class ShowCommitSearchCommand extends common_1.ActiveEditorCachedCommand {
    constructor(git) {
        super(common_1.Commands.ShowCommitSearch);
        this.git = git;
    }
    execute(editor, uri, search, searchBy, goBackCommand) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(uri instanceof vscode_1.Uri)) {
                if (!editor || !editor.document)
                    return undefined;
                uri = editor.document.uri;
            }
            const gitUri = yield gitService_1.GitUri.fromUri(uri, this.git);
            if (!search || searchBy == null) {
                search = yield vscode_1.window.showInputBox({
                    value: search,
                    prompt: `Please enter a search string`,
                    placeHolder: `search by message, author (use @<name>), files (use :<pattern>), or commit id (use #<sha>)`
                });
                if (search === undefined)
                    return goBackCommand && goBackCommand.execute();
                const match = searchByRegex.exec(search);
                if (match && match[1]) {
                    searchBy = searchByMap.get(match[1]);
                    search = search.substring((search[1] === ' ') ? 2 : 1);
                }
                else if (gitService_1.Git.isSha(search)) {
                    searchBy = gitService_1.GitRepoSearchBy.Sha;
                }
                else {
                    searchBy = gitService_1.GitRepoSearchBy.Message;
                }
            }
            try {
                const log = yield this.git.getLogForRepoSearch(gitUri.repoPath, search, searchBy);
                let originalSearch;
                let placeHolder;
                switch (searchBy) {
                    case gitService_1.GitRepoSearchBy.Author:
                        originalSearch = `@${search}`;
                        placeHolder = `commits with author matching '${search}'`;
                        break;
                    case gitService_1.GitRepoSearchBy.Files:
                        originalSearch = `:${search}`;
                        placeHolder = `commits with files matching '${search}'`;
                        break;
                    case gitService_1.GitRepoSearchBy.Message:
                        originalSearch = search;
                        placeHolder = `commits with message matching '${search}'`;
                        break;
                    case gitService_1.GitRepoSearchBy.Sha:
                        originalSearch = `#${search}`;
                        placeHolder = `commits with id matching '${search}'`;
                        break;
                }
                const currentCommand = new quickPicks_1.CommandQuickPickItem({
                    label: `go back \u21A9`,
                    description: `\u00a0 \u2014 \u00a0\u00a0 to commit search`
                }, common_1.Commands.ShowCommitSearch, [gitUri, originalSearch, undefined, goBackCommand]);
                const pick = yield quickPicks_1.CommitsQuickPick.show(this.git, log, placeHolder, currentCommand);
                if (!pick)
                    return undefined;
                if (pick instanceof quickPicks_1.CommandQuickPickItem) {
                    return pick.execute();
                }
                return vscode_1.commands.executeCommand(common_1.Commands.ShowQuickCommitDetails, new gitService_1.GitUri(pick.commit.uri, pick.commit), pick.commit.sha, pick.commit, new quickPicks_1.CommandQuickPickItem({
                    label: `go back \u21A9`,
                    description: `\u00a0 \u2014 \u00a0\u00a0 to search for ${placeHolder}`
                }, common_1.Commands.ShowCommitSearch, [gitUri, search, searchBy, goBackCommand]));
            }
            catch (ex) {
                logger_1.Logger.error(ex, 'ShowCommitSearchCommand');
                return vscode_1.window.showErrorMessage(`Unable to find commits. See output channel for more details`);
            }
        });
    }
}
exports.ShowCommitSearchCommand = ShowCommitSearchCommand;
//# sourceMappingURL=showCommitSearch.js.map