"use strict";
var vscode_languageclient_1 = require("vscode-languageclient");
var path = require("path");
function activate(context) {
    // The server is implemented in Node.
    var serverModule = context.asAbsolutePath(path.join("server", "server.js"));
    // The debug options for the server.
    var debugOptions = {
        execArgv: ["--nolazy", "--debug=6004"]
    };
    // If the extension is launched in debug mode the debug server options are used, otherwise the run options are used.
    var serverOptions = {
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
    var clientOptions = {
        // Register the server for Sass documents.
        documentSelector: ["sass", "sass-indented", "scss"],
        synchronize: {
            // Synchronize the setting section "sasslint" to the server.
            configurationSection: "sasslint"
        }
    };
    // Create the language client and start it.
    var client = new vscode_languageclient_1.LanguageClient("Sass Lint", serverOptions, clientOptions);
    context.subscriptions.push(new vscode_languageclient_1.SettingMonitor(client, "sasslint.enable").start());
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map