'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const system_1 = require("./system");
const vscode_1 = require("vscode");
const constants_1 = require("./constants");
const gitCodeLensProvider_1 = require("./gitCodeLensProvider");
const logger_1 = require("./logger");
class CodeLensController extends vscode_1.Disposable {
    constructor(context, git) {
        super(() => this.dispose());
        this.context = context;
        this.git = git;
        this._onConfigurationChanged();
        const subscriptions = [];
        subscriptions.push(vscode_1.workspace.onDidChangeConfiguration(this._onConfigurationChanged, this));
        subscriptions.push(git.onDidChangeGitCache(this._onGitCacheChanged, this));
        this._disposable = vscode_1.Disposable.from(...subscriptions);
    }
    dispose() {
        this._disposable && this._disposable.dispose();
        this._codeLensProviderDisposable && this._codeLensProviderDisposable.dispose();
        this._codeLensProviderDisposable = undefined;
        this._codeLensProvider = undefined;
    }
    _onConfigurationChanged() {
        const cfg = vscode_1.workspace.getConfiguration().get(constants_1.ExtensionKey);
        if (!system_1.Objects.areEquivalent(cfg.codeLens, this._config && this._config.codeLens)) {
            logger_1.Logger.log('CodeLens config changed; resetting CodeLens provider');
            if (cfg.codeLens.enabled && (cfg.codeLens.recentChange.enabled || cfg.codeLens.authors.enabled)) {
                if (this._codeLensProvider) {
                    this._codeLensProvider.reset();
                }
                else {
                    this._codeLensProvider = new gitCodeLensProvider_1.GitCodeLensProvider(this.context, this.git);
                    this._codeLensProviderDisposable = vscode_1.languages.registerCodeLensProvider(gitCodeLensProvider_1.GitCodeLensProvider.selector, this._codeLensProvider);
                }
            }
            else {
                this._codeLensProviderDisposable && this._codeLensProviderDisposable.dispose();
                this._codeLensProviderDisposable = undefined;
                this._codeLensProvider = undefined;
            }
            constants_1.setCommandContext(constants_1.CommandContext.CanToggleCodeLens, cfg.codeLens.recentChange.enabled || cfg.codeLens.authors.enabled);
        }
        this._config = cfg;
    }
    _onGitCacheChanged() {
        logger_1.Logger.log('Git cache changed; resetting CodeLens provider');
        this._codeLensProvider && this._codeLensProvider.reset();
    }
    toggleCodeLens(editor) {
        if (!this._config.codeLens.recentChange.enabled && !this._config.codeLens.authors.enabled)
            return;
        logger_1.Logger.log(`toggleCodeLens()`);
        if (this._codeLensProviderDisposable) {
            this._codeLensProviderDisposable.dispose();
            this._codeLensProviderDisposable = undefined;
            return;
        }
        this._codeLensProviderDisposable = vscode_1.languages.registerCodeLensProvider(gitCodeLensProvider_1.GitCodeLensProvider.selector, new gitCodeLensProvider_1.GitCodeLensProvider(this.context, this.git));
    }
}
exports.CodeLensController = CodeLensController;
//# sourceMappingURL=codeLensController.js.map