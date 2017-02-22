'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const system_1 = require("./system");
const vscode_1 = require("vscode");
const constants_1 = require("./constants");
const gitProvider_1 = require("./gitProvider");
class GitDiffWithWorkingCodeLens extends vscode_1.CodeLens {
    constructor(git, fileName, commit, range) {
        super(range);
        this.fileName = fileName;
        this.commit = commit;
    }
}
exports.GitDiffWithWorkingCodeLens = GitDiffWithWorkingCodeLens;
class GitDiffWithPreviousCodeLens extends vscode_1.CodeLens {
    constructor(git, fileName, commit, range) {
        super(range);
        this.fileName = fileName;
        this.commit = commit;
    }
}
exports.GitDiffWithPreviousCodeLens = GitDiffWithPreviousCodeLens;
class GitRevisionCodeLensProvider {
    constructor(context, git) {
        this.git = git;
    }
    provideCodeLenses(document, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const gitUri = gitProvider_1.GitUri.fromUri(document.uri, this.git);
            const lenses = [];
            const log = yield this.git.getLogForFile(gitUri.fsPath, gitUri.sha, gitUri.repoPath);
            if (!log)
                return lenses;
            const commit = (gitUri.sha && log.commits.get(gitUri.sha)) || system_1.Iterables.first(log.commits.values());
            if (!commit)
                return lenses;
            lenses.push(new GitDiffWithWorkingCodeLens(this.git, commit.uri.fsPath, commit, new vscode_1.Range(0, 0, 0, 1)));
            if (commit.previousSha) {
                lenses.push(new GitDiffWithPreviousCodeLens(this.git, commit.previousUri.fsPath, commit, new vscode_1.Range(0, 1, 0, 2)));
            }
            return lenses;
        });
    }
    resolveCodeLens(lens, token) {
        if (lens instanceof GitDiffWithWorkingCodeLens)
            return this._resolveDiffWithWorkingTreeCodeLens(lens, token);
        if (lens instanceof GitDiffWithPreviousCodeLens)
            return this._resolveGitDiffWithPreviousCodeLens(lens, token);
        return Promise.reject(undefined);
    }
    _resolveDiffWithWorkingTreeCodeLens(lens, token) {
        lens.command = {
            title: `Compare (${lens.commit.sha}) with Working Tree`,
            command: constants_1.Commands.DiffWithWorking,
            arguments: [
                vscode_1.Uri.file(lens.fileName),
                lens.commit,
                lens.range.start.line
            ]
        };
        return Promise.resolve(lens);
    }
    _resolveGitDiffWithPreviousCodeLens(lens, token) {
        lens.command = {
            title: `Compare (${lens.commit.sha}) with Previous (${lens.commit.previousSha})`,
            command: constants_1.Commands.DiffWithPrevious,
            arguments: [
                vscode_1.Uri.file(lens.fileName),
                lens.commit,
                lens.range.start.line
            ]
        };
        return Promise.resolve(lens);
    }
}
GitRevisionCodeLensProvider.selector = { scheme: constants_1.DocumentSchemes.Git };
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = GitRevisionCodeLensProvider;
//# sourceMappingURL=gitRevisionCodeLensProvider.js.map