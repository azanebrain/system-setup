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
const constants_1 = require("./constants");
const gitProvider_1 = require("./gitProvider");
const logger_1 = require("./logger");
const path = require("path");
class GitContentProvider {
    constructor(context, git) {
        this.git = git;
    }
    provideTextDocumentContent(uri) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = gitProvider_1.default.fromGitUri(uri);
            const fileName = data.originalFileName || data.fileName;
            try {
                let text = yield this.git.getVersionedFileText(fileName, data.repoPath, data.sha);
                if (data.decoration) {
                    text = `${data.decoration}\n${text}`;
                }
                return text;
            }
            catch (ex) {
                logger_1.Logger.error('[GitLens.GitContentProvider]', 'getVersionedFileText', ex);
                yield vscode_1.window.showErrorMessage(`Unable to show Git revision ${data.sha} of '${path.relative(data.repoPath, fileName)}'`);
                return undefined;
            }
        });
    }
}
GitContentProvider.scheme = constants_1.DocumentSchemes.Git;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = GitContentProvider;
//# sourceMappingURL=gitContentProvider.js.map