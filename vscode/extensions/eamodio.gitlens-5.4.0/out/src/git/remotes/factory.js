'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const system_1 = require("../../system");
const vscode_1 = require("vscode");
const bitbucket_1 = require("./bitbucket");
const bitbucket_server_1 = require("./bitbucket-server");
const configuration_1 = require("../../configuration");
const constants_1 = require("../../constants");
const custom_1 = require("./custom");
const github_1 = require("./github");
const gitlab_1 = require("./gitlab");
const logger_1 = require("../../logger");
const provider_1 = require("./provider");
exports.RemoteProvider = provider_1.RemoteProvider;
const visualStudio_1 = require("./visualStudio");
const defaultProviderMap = new Map([
    ['bitbucket.org', (domain, path) => new bitbucket_1.BitbucketService(domain, path)],
    ['github.com', (domain, path) => new github_1.GitHubService(domain, path)],
    ['gitlab.com', (domain, path) => new gitlab_1.GitLabService(domain, path)],
    ['visualstudio.com', (domain, path) => new visualStudio_1.VisualStudioService(domain, path)]
]);
class RemoteProviderFactory {
    static get onDidChange() {
        return this._onDidChange.event;
    }
    static configure(context) {
        context.subscriptions.push(vscode_1.workspace.onDidChangeConfiguration(() => this.onConfigurationChanged()));
        this.onConfigurationChanged(true);
    }
    static getRemoteProvider(domain, path) {
        try {
            let key = domain.toLowerCase();
            if (key.endsWith('visualstudio.com')) {
                key = 'visualstudio.com';
            }
            const creator = this._providerMap.get(key);
            if (creator === undefined)
                return undefined;
            return creator(domain, path);
        }
        catch (ex) {
            logger_1.Logger.error(ex, 'RemoteProviderFactory');
            return undefined;
        }
    }
    static onConfigurationChanged(silent = false) {
        const cfg = vscode_1.workspace.getConfiguration().get(constants_1.ExtensionKey);
        if (cfg === undefined)
            return;
        if (!system_1.Objects.areEquivalent(cfg.remotes, this._remotesCfg)) {
            this._providerMap = new Map(defaultProviderMap);
            this._remotesCfg = cfg.remotes;
            if (this._remotesCfg != null && this._remotesCfg.length > 0) {
                for (const remoteCfg of this._remotesCfg) {
                    const provider = this.getCustomProvider(remoteCfg);
                    if (provider === undefined)
                        continue;
                    this._providerMap.set(remoteCfg.domain.toLowerCase(), provider);
                }
                if (!silent) {
                    this._onDidChange.fire();
                }
            }
        }
    }
    static getCustomProvider(cfg) {
        switch (cfg.type) {
            case configuration_1.CustomRemoteType.Bitbucket: return (domain, path) => new bitbucket_1.BitbucketService(domain, path, cfg.name, true);
            case configuration_1.CustomRemoteType.BitbucketServer: return (domain, path) => new bitbucket_server_1.BitbucketServerService(domain, path, cfg.name, true);
            case configuration_1.CustomRemoteType.Custom: return (domain, path) => new custom_1.CustomService(domain, path, cfg);
            case configuration_1.CustomRemoteType.GitHub: return (domain, path) => new github_1.GitHubService(domain, path, cfg.name, true);
            case configuration_1.CustomRemoteType.GitLab: return (domain, path) => new gitlab_1.GitLabService(domain, path, cfg.name, true);
        }
        return undefined;
    }
}
RemoteProviderFactory._onDidChange = new vscode_1.EventEmitter();
exports.RemoteProviderFactory = RemoteProviderFactory;
//# sourceMappingURL=factory.js.map