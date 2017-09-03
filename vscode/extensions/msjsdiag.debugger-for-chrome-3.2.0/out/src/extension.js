"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const Core = require("vscode-chrome-debug-core");
const utils_1 = require("./utils");
function activate(context) {
    context.subscriptions.push(vscode.commands.registerCommand('extension.chrome-debug.toggleSkippingFile', toggleSkippingFile));
    context.subscriptions.push(vscode.commands.registerCommand('extension.chrome-debug.startSession', startSession));
}
exports.activate = activate;
function deactivate() {
}
exports.deactivate = deactivate;
function toggleSkippingFile(path) {
    if (!path) {
        const activeEditor = vscode.window.activeTextEditor;
        path = activeEditor && activeEditor.document.fileName;
    }
    const args = typeof path === 'string' ? { path } : { sourceReference: path };
    vscode.commands.executeCommand('workbench.customDebugRequest', 'toggleSkipFileStatus', args);
}
;
function startSession(config) {
    return __awaiter(this, void 0, void 0, function* () {
        if (config.request === 'attach') {
            const discovery = new Core.chromeTargetDiscoveryStrategy.ChromeTargetDiscovery(new Core.NullLogger(), new Core.telemetry.NullTelemetryReporter());
            const targets = yield discovery.getAllTargets(config.address || '127.0.0.1', config.port, utils_1.targetFilter, config.url);
            if (targets.length > 1) {
                const selectedTarget = yield pickTarget(targets);
                if (!selectedTarget) {
                    // Quickpick canceled, bail
                    return;
                }
                config.websocketUrl = selectedTarget.websocketDebuggerUrl;
            }
        }
        if (config.request) {
            vscode.commands.executeCommand('vscode.startDebug', config);
            return Promise.resolve({ status: 'ok' });
        }
        else {
            return Promise.resolve({ status: 'initialConfiguration' });
        }
    });
}
function pickTarget(targets) {
    return __awaiter(this, void 0, void 0, function* () {
        const items = targets.map(target => ({
            label: unescapeTargetTitle(target.title),
            detail: target.url,
            websocketDebuggerUrl: target.webSocketDebuggerUrl
        }));
        const selected = yield vscode.window.showQuickPick(items, { placeHolder: 'Select a tab', matchOnDescription: true, matchOnDetail: true });
        return selected;
    });
}
function unescapeTargetTitle(title) {
    return title
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#39;/g, `'`)
        .replace(/&quot;/g, '"');
}
//# sourceMappingURL=extension.js.map