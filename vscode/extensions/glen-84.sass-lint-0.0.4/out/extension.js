"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const vscode_languageclient_1 = require("vscode-languageclient");
const path = require("path");
function activate(context) {
    // The server is implemented in Node.
    const serverModule = context.asAbsolutePath(path.join("server", "server.js"));
    // The debug options for the server.
    const debugOptions = {
        execArgv: ["--nolazy", "--debug=6004"]
    };
    // If the extension is launched in debug mode the debug server options are used, otherwise the run options are used.
    const serverOptions = {
        run: {
            module: serverModule,
            transport: vscode_languageclient_1.TransportKind.ipc
        },
        debug: {
            module: serverModule,
            transport: vscode_languageclient_1.TransportKind.ipc,
            options: debugOptions
        }
    };
    // Options to control the language client.
    const clientOptions = {
        // Register the server for Sass documents.
        documentSelector: ["sass", "scss"],
        synchronize: {
            // Synchronize the setting section "sasslint" to the server.
            configurationSection: "sasslint",
            fileEvents: vscode_1.workspace.createFileSystemWatcher("**/.sass-lint.yml")
        }
    };
    // Create the language client and start it.
    const client = new vscode_languageclient_1.LanguageClient("Sass Lint", serverOptions, clientOptions);
    context.subscriptions.push(new vscode_languageclient_1.SettingMonitor(client, "sasslint.enable").start());
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map