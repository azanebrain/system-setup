'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const telemetry_1 = require("./telemetry");
const ConfigurationName = 'gitlens';
const OutputChannelName = 'GitLens';
const ConsolePrefix = `[${OutputChannelName}]`;
exports.OutputLevel = {
    Silent: 'silent',
    Errors: 'errors',
    Verbose: 'verbose'
};
let debug = false;
let level = exports.OutputLevel.Silent;
let output;
function onConfigurationChanged() {
    const cfg = vscode_1.workspace.getConfiguration(ConfigurationName).get('advanced');
    if (cfg.debug !== debug || cfg.output.level !== level) {
        debug = cfg.debug;
        level = cfg.output.level;
        if (level === exports.OutputLevel.Silent) {
            output && output.dispose();
        }
        else {
            output = output || vscode_1.window.createOutputChannel(OutputChannelName);
        }
    }
}
class Logger {
    static configure(context) {
        context.subscriptions.push(vscode_1.workspace.onDidChangeConfiguration(onConfigurationChanged));
        onConfigurationChanged();
    }
    static log(message, ...params) {
        if (debug && level !== exports.OutputLevel.Silent) {
            console.log(ConsolePrefix, message, ...params, '\n');
        }
        if (level === exports.OutputLevel.Verbose) {
            output.appendLine([message, ...params].join(' '));
        }
    }
    static error(ex, classOrMethod, ...params) {
        if (debug) {
            console.error(ConsolePrefix, ex, ...params, '\n');
        }
        if (level !== exports.OutputLevel.Silent) {
            output.appendLine([ex, ...params].join(' '));
        }
        telemetry_1.Telemetry.trackException(ex);
    }
    static warn(message, ...params) {
        if (debug) {
            console.warn(ConsolePrefix, message, ...params, '\n');
        }
        if (level !== exports.OutputLevel.Silent) {
            output.appendLine([message, ...params].join(' '));
        }
    }
}
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map