"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const vscode_languageclient_1 = require("vscode-languageclient");
const path = require("path");
// tslint:disable-next-line:no-namespace
var NoSassLintLibraryRequest;
(function (NoSassLintLibraryRequest) {
    NoSassLintLibraryRequest.type = new vscode_languageclient_1.RequestType("sass-lint/noLibrary");
})(NoSassLintLibraryRequest || (NoSassLintLibraryRequest = {}));
function activate(context) {
    // The server is implemented in Node.
    const serverModule = context.asAbsolutePath(path.join("server", "server.js"));
    // The debug options for the server.
    const debugOptions = {
        execArgv: ["--nolazy", "--inspect=6010"]
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
        },
        diagnosticCollectionName: "sass-lint",
        initializationFailedHandler: (error) => {
            client.error("Server initialization failed.", error);
            client.outputChannel.show(true);
            return false;
        },
        middleware: {
            workspace: {
                configuration: (params, token, 
                    // tslint:disable-next-line:no-any
                    next
                    // tslint:disable-next-line:no-any
                ) => {
                    if (!params.items) {
                        return [];
                    }
                    const result = next(params, token, next);
                    result[0] = deepClone(result[0]); // The convertToAbsolutePaths function modifies the settings.
                    let scopeUri = "";
                    for (const item of params.items) {
                        if (!item.scopeUri) {
                            continue;
                        }
                        else {
                            scopeUri = item.scopeUri;
                        }
                    }
                    const resource = client.protocol2CodeConverter.asUri(scopeUri);
                    const workspaceFolder = vscode_1.workspace.getWorkspaceFolder(resource);
                    if (workspaceFolder) {
                        convertToAbsolutePaths(result[0], workspaceFolder);
                    }
                    return result;
                }
            }
        }
    };
    function convertToAbsolutePaths(settings, folder) {
        const configFile = settings.configFile;
        if (configFile) {
            settings.configFile = convertAbsolute(configFile, folder);
        }
        const nodePath = settings.nodePath;
        if (nodePath) {
            settings.nodePath = convertAbsolute(nodePath, folder);
        }
    }
    function convertAbsolute(file, folder) {
        if (path.isAbsolute(file)) {
            return file;
        }
        const folderPath = folder.uri.fsPath;
        if (!folderPath) {
            return file;
        }
        return path.join(folderPath, file);
    }
    // Create the language client and start it.
    const client = new vscode_languageclient_1.LanguageClient("Sass Lint", serverOptions, clientOptions);
    client.registerProposedFeatures();
    client.onReady().then(() => {
        client.onRequest(NoSassLintLibraryRequest.type, (params) => {
            const uri = vscode_1.Uri.parse(params.source.uri);
            const workspaceFolder = vscode_1.workspace.getWorkspaceFolder(uri);
            const packageManager = vscode_1.workspace.getConfiguration("sasslint", uri).get("packageManager", "npm");
            client.info(getInstallFailureMessage(uri, workspaceFolder, packageManager));
            return {};
        });
    });
    function getInstallFailureMessage(uri, workspaceFolder, packageManager) {
        const localCommands = {
            npm: "npm install sass-lint",
            yarn: "yarn add sass-lint"
        };
        const globalCommands = {
            npm: "npm install -g sass-lint",
            yarn: "yarn global add sass-lint"
        };
        const localCmd = localCommands[packageManager];
        const globalCmd = globalCommands[packageManager];
        const failureMessage = `Failed to load the sass-lint library for the document "${uri.fsPath}"\n\n`;
        if (workspaceFolder) {
            return [
                failureMessage,
                `To use sass-lint in this workspace, install it using "${localCmd}", or globally using "${globalCmd}".`,
                "\n\nYou need to reopen the workspace after installing sass-lint."
            ].join("");
        }
        else {
            return [
                failureMessage,
                `To use sass-lint for a single file, install it globally using "${globalCmd}".`,
                "\n\nYou need to reopen VS Code after installing sass-lint."
            ].join("");
        }
    }
    client.start();
}
exports.activate = activate;
function deepClone(obj) {
    if (!obj || typeof obj !== "object") {
        return obj;
    }
    // tslint:disable-next-line:no-any
    const result = Array.isArray(obj) ? [] : {};
    Object.getOwnPropertyNames(obj).forEach((key) => {
        if (obj[key] && typeof obj[key] === "object") {
            result[key] = deepClone(obj[key]);
        }
        else {
            result[key] = obj[key];
        }
    });
    return result;
}
//# sourceMappingURL=extension.js.map