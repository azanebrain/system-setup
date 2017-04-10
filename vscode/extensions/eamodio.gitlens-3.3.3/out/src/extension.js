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
const system_1 = require("./system");
const vscode_1 = require("vscode");
const blameActiveLineController_1 = require("./blameActiveLineController");
const blameAnnotationController_1 = require("./blameAnnotationController");
const commands_1 = require("./commands");
const commands_2 = require("./commands");
const commands_3 = require("./commands");
const commands_4 = require("./commands");
const commands_5 = require("./commands");
const commands_6 = require("./commands");
const commands_7 = require("./commands");
const commands_8 = require("./commands");
const commands_9 = require("./commands");
const commands_10 = require("./commands");
const commands_11 = require("./commands");
const commands_12 = require("./commands");
const commands_13 = require("./commands");
const commands_14 = require("./commands");
const constants_1 = require("./constants");
const gitContentProvider_1 = require("./gitContentProvider");
const gitService_1 = require("./gitService");
const gitRevisionCodeLensProvider_1 = require("./gitRevisionCodeLensProvider");
const logger_1 = require("./logger");
const telemetry_1 = require("./telemetry");
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.Logger.configure(context);
        telemetry_1.Telemetry.configure(constants_1.ApplicationInsightsKey);
        const gitlens = vscode_1.extensions.getExtension(constants_1.ExtensionId);
        const gitlensVersion = gitlens.packageJSON.version;
        const rootPath = vscode_1.workspace.rootPath && vscode_1.workspace.rootPath.replace(/\\/g, '/');
        logger_1.Logger.log(`GitLens(v${gitlensVersion}) active: ${rootPath}`);
        const config = vscode_1.workspace.getConfiguration('').get('gitlens');
        const gitPath = config.advanced.git;
        try {
            yield gitService_1.Git.getGitPath(gitPath);
        }
        catch (ex) {
            logger_1.Logger.error(ex, 'Extension.activate');
            if (ex.message.includes('Unable to find git')) {
                yield vscode_1.window.showErrorMessage(`GitLens was unable to find Git. Please make sure Git is installed. Also ensure that Git is either in the PATH, or that 'gitlens.advanced.git' is pointed to its installed location.`);
            }
            commands_1.setCommandContext(commands_1.CommandContext.Enabled, false);
            return;
        }
        const repoPath = yield gitService_1.Git.getRepoPath(rootPath);
        const gitVersion = gitService_1.Git.gitInfo().version;
        logger_1.Logger.log(`Git version: ${gitVersion}`);
        const telemetryContext = Object.create(null);
        telemetryContext.version = gitlensVersion;
        telemetryContext['git.version'] = gitVersion;
        telemetry_1.Telemetry.setContext(telemetryContext);
        notifyOnUnsupportedGitVersion(context, gitVersion);
        notifyOnNewGitLensVersion(context, gitlensVersion);
        const git = new gitService_1.GitService(context, repoPath);
        context.subscriptions.push(git);
        const gitContextTracker = new gitService_1.GitContextTracker(git);
        context.subscriptions.push(gitContextTracker);
        context.subscriptions.push(vscode_1.workspace.registerTextDocumentContentProvider(gitContentProvider_1.GitContentProvider.scheme, new gitContentProvider_1.GitContentProvider(context, git)));
        context.subscriptions.push(vscode_1.languages.registerCodeLensProvider(gitRevisionCodeLensProvider_1.GitRevisionCodeLensProvider.selector, new gitRevisionCodeLensProvider_1.GitRevisionCodeLensProvider(context, git)));
        const annotationController = new blameAnnotationController_1.BlameAnnotationController(context, git, gitContextTracker);
        context.subscriptions.push(annotationController);
        const activeLineController = new blameActiveLineController_1.BlameActiveLineController(context, git, gitContextTracker, annotationController);
        context.subscriptions.push(activeLineController);
        context.subscriptions.push(new commands_14.Keyboard());
        context.subscriptions.push(new commands_2.CloseUnchangedFilesCommand(git));
        context.subscriptions.push(new commands_2.OpenChangedFilesCommand(git));
        context.subscriptions.push(new commands_4.CopyMessageToClipboardCommand(git));
        context.subscriptions.push(new commands_4.CopyShaToClipboardCommand(git));
        context.subscriptions.push(new commands_5.DiffDirectoryCommand(git));
        context.subscriptions.push(new commands_5.DiffLineWithPreviousCommand(git));
        context.subscriptions.push(new commands_5.DiffLineWithWorkingCommand(git));
        context.subscriptions.push(new commands_5.DiffWithBranchCommand(git));
        context.subscriptions.push(new commands_5.DiffWithNextCommand(git));
        context.subscriptions.push(new commands_5.DiffWithPreviousCommand(git));
        context.subscriptions.push(new commands_5.DiffWithWorkingCommand(git));
        context.subscriptions.push(new commands_3.OpenCommitInRemoteCommand(git));
        context.subscriptions.push(new commands_3.OpenFileInRemoteCommand(git));
        context.subscriptions.push(new commands_3.OpenInRemoteCommand());
        context.subscriptions.push(new commands_6.ShowBlameCommand(annotationController));
        context.subscriptions.push(new commands_6.ToggleBlameCommand(annotationController));
        context.subscriptions.push(new commands_7.ShowBlameHistoryCommand(git));
        context.subscriptions.push(new commands_7.ShowFileHistoryCommand(git));
        context.subscriptions.push(new commands_8.ShowLastQuickPickCommand());
        context.subscriptions.push(new commands_9.ShowQuickBranchHistoryCommand(git));
        context.subscriptions.push(new commands_9.ShowQuickCurrentBranchHistoryCommand(git));
        context.subscriptions.push(new commands_10.ShowQuickCommitDetailsCommand(git));
        context.subscriptions.push(new commands_10.ShowQuickCommitFileDetailsCommand(git));
        context.subscriptions.push(new commands_10.ShowCommitSearchCommand(git));
        context.subscriptions.push(new commands_9.ShowQuickFileHistoryCommand(git));
        context.subscriptions.push(new commands_11.ShowQuickRepoStatusCommand(git));
        context.subscriptions.push(new commands_11.ShowQuickStashListCommand(git));
        context.subscriptions.push(new commands_12.StashApplyCommand(git));
        context.subscriptions.push(new commands_12.StashDeleteCommand(git));
        context.subscriptions.push(new commands_12.StashSaveCommand(git));
        context.subscriptions.push(new commands_13.ToggleCodeLensCommand(git));
        telemetry_1.Telemetry.trackEvent('initialized', system_1.Objects.flatten(config, 'config', true));
    });
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
function notifyOnNewGitLensVersion(context, version) {
    return __awaiter(this, void 0, void 0, function* () {
        if (context.globalState.get(constants_1.WorkspaceState.SuppressUpdateNotice, false))
            return;
        const previousVersion = context.globalState.get(constants_1.WorkspaceState.GitLensVersion);
        yield context.globalState.update(constants_1.WorkspaceState.GitLensVersion, version);
        if (previousVersion) {
            const [major, minor] = version.split('.');
            const [prevMajor, prevMinor] = previousVersion.split('.');
            if (major === prevMajor && minor === prevMinor)
                return;
        }
        const result = yield vscode_1.window.showInformationMessage(`GitLens has been updated to v${version}`, 'View Release Notes', `Don't Show Again`);
        if (result === 'View Release Notes') {
            vscode_1.commands.executeCommand(constants_1.BuiltInCommands.Open, vscode_1.Uri.parse('https://marketplace.visualstudio.com/items/eamodio.gitlens/changelog'));
        }
        else if (result === `Don't Show Again`) {
            context.globalState.update(constants_1.WorkspaceState.SuppressUpdateNotice, true);
        }
    });
}
function notifyOnUnsupportedGitVersion(context, version) {
    return __awaiter(this, void 0, void 0, function* () {
        if (context.globalState.get(constants_1.WorkspaceState.SuppressGitVersionWarning, false))
            return;
        if (!gitService_1.Git.validateVersion(2, 2)) {
            const result = yield vscode_1.window.showErrorMessage(`GitLens requires a newer version of Git (>= 2.2.0) than is currently installed (${version}). Please install a more recent version of Git.`, `Don't Show Again`);
            if (result === `Don't Show Again`) {
                context.globalState.update(constants_1.WorkspaceState.SuppressGitVersionWarning, true);
            }
        }
    });
}
//# sourceMappingURL=extension.js.map