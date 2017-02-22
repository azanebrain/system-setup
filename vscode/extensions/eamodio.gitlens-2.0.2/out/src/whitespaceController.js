'use strict';
const vscode_1 = require("vscode");
const logger_1 = require("./logger");
var SettingLocation;
(function (SettingLocation) {
    SettingLocation[SettingLocation["workspace"] = 0] = "workspace";
    SettingLocation[SettingLocation["global"] = 1] = "global";
    SettingLocation[SettingLocation["default"] = 2] = "default";
})(SettingLocation || (SettingLocation = {}));
class WhitespaceController extends vscode_1.Disposable {
    constructor() {
        super(() => this.dispose());
        this._count = 0;
        this._disposed = false;
        this._ignoreNextConfigChange = false;
        this._renderWhitespaceLocation = SettingLocation.default;
        const subscriptions = [];
        subscriptions.push(vscode_1.workspace.onDidChangeConfiguration(this._onConfigurationChanged, this));
        this._disposable = vscode_1.Disposable.from(...subscriptions);
        this._onConfigurationChanged();
    }
    dispose() {
        this._disposed = true;
        if (this._count !== 0) {
            this._restoreWhitespace();
            this._count = 0;
        }
    }
    _onConfigurationChanged() {
        if (this._disposed)
            return;
        if (this._ignoreNextConfigChange) {
            this._ignoreNextConfigChange = false;
            logger_1.Logger.log(`Whitespace changed; ignored`);
            return;
        }
        const config = vscode_1.workspace.getConfiguration('editor');
        const inspection = config.inspect('renderWhitespace');
        if (inspection.workspaceValue) {
            this._renderWhitespace = inspection.workspaceValue;
            this._renderWhitespaceLocation = SettingLocation.workspace;
        }
        else if (inspection.globalValue) {
            this._renderWhitespace = inspection.globalValue;
            this._renderWhitespaceLocation = SettingLocation.global;
        }
        else {
            this._renderWhitespace = inspection.defaultValue;
            this._renderWhitespaceLocation = SettingLocation.default;
        }
        logger_1.Logger.log(`Whitespace changed; renderWhitespace=${this._renderWhitespace}, location=${this._renderWhitespaceLocation}`);
        this._requiresOverride = !(this._renderWhitespace == null || this._renderWhitespace === 'none');
        if (this._requiresOverride) {
            if (this._count !== 0) {
                this._overrideWhitespace();
            }
        }
    }
    override() {
        if (this._disposed)
            return;
        logger_1.Logger.log(`Request whitespace override; count=${this._count}`);
        if (this._count === 0 && this._requiresOverride) {
            this._ignoreNextConfigChange = true;
            this._overrideWhitespace();
        }
        this._count++;
    }
    _overrideWhitespace() {
        logger_1.Logger.log(`Override whitespace`);
        const config = vscode_1.workspace.getConfiguration('editor');
        config.update('renderWhitespace', 'none', this._renderWhitespaceLocation === SettingLocation.global);
    }
    restore() {
        if (this._disposed || this._count === 0)
            return;
        logger_1.Logger.log(`Request whitespace restore; count=${this._count}`);
        this._count--;
        if (this._count === 0 && this._requiresOverride) {
            this._restoreWhitespace();
        }
    }
    _restoreWhitespace() {
        logger_1.Logger.log(`Restore whitespace`);
        const config = vscode_1.workspace.getConfiguration('editor');
        config.update('renderWhitespace', this._renderWhitespaceLocation === SettingLocation.default
            ? undefined
            : this._renderWhitespace, this._renderWhitespaceLocation === SettingLocation.global);
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = WhitespaceController;
//# sourceMappingURL=whitespaceController.js.map