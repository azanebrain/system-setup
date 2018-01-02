"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var vscode_1 = require("vscode");
var vscode_languageclient_1 = require("vscode-languageclient");
function activate(context) {
    // The server is implemented in node
    var serverModule = context.asAbsolutePath(path.join('server', 'server.js'));
    // The debug options for the server
    var debugOptions = { execArgv: ["--nolazy", "--debug=6009"] };
    // If the extension is launched in debug mode then the debug server options are used
    // Otherwise the run options are used
    var serverOptions = {
        run: { module: serverModule, transport: vscode_languageclient_1.TransportKind.ipc },
        debug: { module: serverModule, transport: vscode_languageclient_1.TransportKind.ipc /* *, options: debugOptions /* */ }
    };
    // Options to control the language client
    var clientOptions = {
        // Register the server for Angular templates
        documentSelector: ['ng-template', 'html', 'typescript'],
        // Information in the TypeScript project is necessary to generate Angular template completions
        synchronize: {
            fileEvents: [
                vscode_1.workspace.createFileSystemWatcher('**/tsconfig.json'),
                vscode_1.workspace.createFileSystemWatcher('**/*.ts')
            ]
        },
    };
    // Create the language client and start the client.
    var disposable = new vscode_languageclient_1.LanguageClient('Angular Language Service', serverOptions, clientOptions, true).start();
    // Push the disposable to the context's subscriptions so that the
    // client can be deactivated on extension deactivation
    context.subscriptions.push(disposable);
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map