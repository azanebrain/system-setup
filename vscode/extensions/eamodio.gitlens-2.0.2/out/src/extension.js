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
const blameAnnotationController_1 = require("./blameAnnotationController");
const blameStatusBarController_1 = require("./blameStatusBarController");
const blameAnnotationFormatter_1 = require("./blameAnnotationFormatter");
const diffLineWithPrevious_1 = require("./commands/diffLineWithPrevious");
const diffLineWithWorking_1 = require("./commands/diffLineWithWorking");
const diffWithPrevious_1 = require("./commands/diffWithPrevious");
const diffWithWorking_1 = require("./commands/diffWithWorking");
const showBlame_1 = require("./commands/showBlame");
const showBlameHistory_1 = require("./commands/showBlameHistory");
const showFileHistory_1 = require("./commands/showFileHistory");
const showQuickFileHistory_1 = require("./commands/showQuickFileHistory");
const showQuickRepoHistory_1 = require("./commands/showQuickRepoHistory");
const toggleBlame_1 = require("./commands/toggleBlame");
const toggleCodeLens_1 = require("./commands/toggleCodeLens");
const constants_1 = require("./constants");
const gitContentProvider_1 = require("./gitContentProvider");
const gitProvider_1 = require("./gitProvider");
const gitRevisionCodeLensProvider_1 = require("./gitRevisionCodeLensProvider");
const logger_1 = require("./logger");
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!vscode_1.workspace.rootPath) {
            logger_1.Logger.warn('GitLens inactive: no rootPath');
            return;
        }
        const rootPath = vscode_1.workspace.rootPath.replace(/\\/g, '/');
        logger_1.Logger.log(`GitLens active: ${rootPath}`);
        const config = vscode_1.workspace.getConfiguration('gitlens');
        const gitPath = config.get('advanced').git;
        blameAnnotationFormatter_1.configureCssCharacters(config.get('blame'));
        let repoPath;
        try {
            repoPath = yield gitProvider_1.Git.repoPath(rootPath, gitPath);
        }
        catch (ex) {
            logger_1.Logger.error(ex);
            if (ex.message.includes('Unable to find git')) {
                yield vscode_1.window.showErrorMessage(`GitLens: Unable to find Git. Please make sure Git is installed. Also ensure that Git is either in the PATH, or that 'gitlens.advanced.git' is pointed to its installed location.`);
            }
            return;
        }
        context.workspaceState.update(constants_1.WorkspaceState.RepoPath, repoPath);
        const git = new gitProvider_1.default(context);
        context.subscriptions.push(git);
        context.subscriptions.push(vscode_1.workspace.registerTextDocumentContentProvider(gitContentProvider_1.default.scheme, new gitContentProvider_1.default(context, git)));
        context.subscriptions.push(vscode_1.languages.registerCodeLensProvider(gitRevisionCodeLensProvider_1.default.selector, new gitRevisionCodeLensProvider_1.default(context, git)));
        const annotationController = new blameAnnotationController_1.default(context, git);
        context.subscriptions.push(annotationController);
        const statusBarController = new blameStatusBarController_1.default(context, git);
        context.subscriptions.push(statusBarController);
        context.subscriptions.push(new diffWithWorking_1.default(git));
        context.subscriptions.push(new diffLineWithWorking_1.default(git));
        context.subscriptions.push(new diffWithPrevious_1.default(git));
        context.subscriptions.push(new diffLineWithPrevious_1.default(git));
        context.subscriptions.push(new showBlame_1.default(annotationController));
        context.subscriptions.push(new toggleBlame_1.default(annotationController));
        context.subscriptions.push(new showBlameHistory_1.default(git));
        context.subscriptions.push(new showFileHistory_1.default(git));
        context.subscriptions.push(new showQuickFileHistory_1.default(git));
        context.subscriptions.push(new showQuickRepoHistory_1.default(git, repoPath));
        context.subscriptions.push(new toggleCodeLens_1.default(git));
    });
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map