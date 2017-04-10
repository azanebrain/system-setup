'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const vscode = require("vscode");
const appInsights = require("applicationinsights");
const os = require("os");
let _reporter;
class Telemetry extends vscode_1.Disposable {
    static configure(key) {
        _reporter = new TelemetryReporter(key);
    }
    static setContext(context) {
        _reporter && _reporter.setContext(context);
    }
    static trackEvent(name, properties, measurements) {
        _reporter && _reporter.trackEvent(name, properties, measurements);
    }
    static trackException(ex) {
        _reporter && _reporter.trackException(ex);
    }
}
exports.Telemetry = Telemetry;
class TelemetryReporter extends vscode_1.Disposable {
    constructor(key) {
        super(() => this.dispose());
        appInsights.setup(key)
            .setAutoCollectConsole(false)
            .setAutoCollectExceptions(false)
            .setAutoCollectPerformance(false)
            .setAutoCollectRequests(false);
        appInsights
            .setAutoCollectDependencies(false)
            .setAutoDependencyCorrelation(false)
            .setOfflineMode(true);
        this._client = appInsights.start().client;
        this.setContext();
        this._stripPII(this._client);
        this._onConfigurationChanged();
        const subscriptions = [];
        subscriptions.push(vscode_1.workspace.onDidChangeConfiguration(this._onConfigurationChanged, this));
        this._disposable = vscode_1.Disposable.from(...subscriptions);
    }
    dispose() {
        this._disposable && this._disposable.dispose();
    }
    setContext(context) {
        if (!this._context) {
            this._context = Object.create(null);
            this._context['code.language'] = vscode.env.language;
            this._context['code.version'] = vscode.version;
            this._context[this._client.context.keys.sessionId] = vscode.env.sessionId;
            this._context['os.platform'] = os.platform();
            this._context['os.version'] = os.release();
        }
        if (context) {
            Object.assign(this._context, context);
        }
        Object.assign(this._client.commonProperties, this._context);
    }
    trackEvent(name, properties, measurements) {
        if (!this._enabled)
            return;
        this._client.trackEvent(name, properties, measurements);
    }
    trackException(ex) {
        if (!this._enabled)
            return;
        this._client.trackException(ex);
    }
    _onConfigurationChanged() {
        this._enabled = vscode_1.workspace.getConfiguration('telemetry').get('enableTelemetry', true);
    }
    _stripPII(client) {
        if (client && client.context && client.context.keys && client.context.tags) {
            const machineNameKey = client.context.keys.deviceMachineName;
            client.context.tags[machineNameKey] = '';
        }
    }
}
exports.TelemetryReporter = TelemetryReporter;
//# sourceMappingURL=telemetry.js.map