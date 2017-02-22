'use strict';
const system_1 = require("./system");
const vscode_1 = require("vscode");
const configuration_1 = require("./configuration");
let config;
let output;
vscode_1.workspace.onDidChangeConfiguration(onConfigurationChange);
onConfigurationChange();
function onConfigurationChange() {
    const cfg = vscode_1.workspace.getConfiguration('gitlens').get('advanced');
    if (!system_1.Objects.areEquivalent(cfg.output, config && config.output)) {
        if (cfg.output.level === configuration_1.OutputLevel.Silent) {
            output && output.dispose();
        }
        else if (!output) {
            output = vscode_1.window.createOutputChannel('GitLens');
        }
    }
    config = cfg;
}
class Logger {
    static log(message, ...params) {
        if (config.debug) {
            console.log('[GitLens]', message, ...params);
        }
        if (config.output.level === configuration_1.OutputLevel.Verbose) {
            output.appendLine([message, ...params].join(' '));
        }
    }
    static error(message, ...params) {
        if (config.debug) {
            console.error('[GitLens]', message, ...params);
        }
        if (config.output.level !== configuration_1.OutputLevel.Silent) {
            output.appendLine([message, ...params].join(' '));
        }
    }
    static warn(message, ...params) {
        if (config.debug) {
            console.warn('[GitLens]', message, ...params);
        }
        if (config.output.level !== configuration_1.OutputLevel.Silent) {
            output.appendLine([message, ...params].join(' '));
        }
    }
}
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map