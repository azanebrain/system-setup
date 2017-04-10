"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_languageserver_1 = require("vscode-languageserver");
const chokidar = require("chokidar");
const fs = require("fs");
const globule = require("globule");
const path = require("path");
// Create a connection for the server. The connection uses Node's IPC as a transport.
const connection = vscode_languageserver_1.createConnection(new vscode_languageserver_1.IPCMessageReader(process), new vscode_languageserver_1.IPCMessageWriter(process));
// Create a simple text document manager. The text document manager supports full document sync only.
const documents = new vscode_languageserver_1.TextDocuments();
// Make the text document manager listen on the connection for open, change, and close text document events.
documents.listen(connection);
let sassLint;
let settings;
let configPathCache = {};
let settingsConfigFile;
let settingsConfigFileWatcher = null;
const CONFIG_FILE_NAME = ".sass-lint.yml";
// After the server has started the client sends an initialize request.
// The server receives in the passed params the rootPath of the workspace plus the client capabilities.
let workspaceRoot;
connection.onInitialize((params) => {
    workspaceRoot = params.rootPath; // TODO: Find out how to handle this null (and switch to rootUri)
    return vscode_languageserver_1.Files.resolveModule(workspaceRoot, "sass-lint").then((value) => {
        sassLint = value;
        let result = {
            capabilities: {
                textDocumentSync: documents.syncKind
            }
        };
        return result;
    }, () => {
        return Promise.reject(new vscode_languageserver_1.ResponseError(99, `Failed to load sass-lint library. Please install sass-lint in your workspace folder using 'npm
                    install sass-lint' or globally using 'npm install sass-lint -g' and then press Retry.`, { retry: true }));
    });
});
// The content of a text document has changed.
// This event is emitted when the text document is first opened or when its content has changed.
documents.onDidChangeContent((event) => {
    if (settings.sasslint.run === "onType") {
        validateTextDocument(event.document);
    }
});
documents.onDidSave((event) => {
    if (settings.sasslint.run === "onSave") {
        validateTextDocument(event.document);
    }
});
// A text document was closed. Clear the diagnostics.
documents.onDidClose((event) => {
    connection.sendDiagnostics({ uri: event.document.uri, diagnostics: [] });
});
function validateTextDocument(textDocument) {
    let filePath = vscode_languageserver_1.Files.uriToFilePath(textDocument.uri);
    if (!filePath) {
        // Sass Lint can only lint files on disk.
        return;
    }
    const diagnostics = [];
    const configFile = getConfigFile(filePath);
    const compiledConfig = sassLint.getConfig({}, configFile);
    const relativePath = getFilePath(filePath, configFile);
    if (globule.isMatch(compiledConfig.files.include, relativePath) &&
        !globule.isMatch(compiledConfig.files.ignore, relativePath)) {
        const result = sassLint.lintText({
            text: textDocument.getText(),
            format: path.extname(filePath).slice(1),
            filename: filePath
        }, {}, configFile);
        for (const msg of result.messages) {
            diagnostics.push(makeDiagnostic(msg));
        }
    }
    // Send the computed diagnostics to VSCode.
    connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}
function validateAllTextDocuments(textDocuments) {
    const tracker = new vscode_languageserver_1.ErrorMessageTracker();
    for (const document of textDocuments) {
        try {
            validateTextDocument(document);
        }
        catch (err) {
            tracker.add(getErrorMessage(err, document));
        }
    }
    tracker.sendErrors(connection);
}
function getConfigFile(filePath) {
    const dirName = path.dirname(filePath);
    let configFile = configPathCache[dirName];
    if (configFile) {
        return configFile;
    }
    else {
        configFile = locateFile(dirName, CONFIG_FILE_NAME);
        if (configFile) {
            // Cache.
            configPathCache[dirName] = configFile;
            return configFile;
        }
    }
    if (settingsConfigFile) {
        // Cache.
        configPathCache[dirName] = settingsConfigFile;
        return settingsConfigFile;
    }
    return null;
}
function locateFile(directory, fileName) {
    let parent = directory;
    do {
        directory = parent;
        const location = path.join(directory, fileName);
        try {
            fs.accessSync(location, fs.constants.R_OK);
            return location;
        }
        catch (e) {
            // Do nothing.
        }
        parent = path.dirname(directory);
    } while (parent !== directory);
    return null;
}
;
function getFilePath(absolutePath, configFilePath) {
    if (settings.sasslint.resolvePathsRelativeToConfig) {
        return path.relative(path.dirname(configFilePath), absolutePath);
    }
    else {
        return path.relative(workspaceRoot, absolutePath);
    }
}
function makeDiagnostic(msg) {
    let severity;
    switch (msg.severity) {
        case 1:
            severity = vscode_languageserver_1.DiagnosticSeverity.Warning;
            break;
        case 2:
            severity = vscode_languageserver_1.DiagnosticSeverity.Error;
            break;
        default:
            severity = vscode_languageserver_1.DiagnosticSeverity.Information;
            break;
    }
    let line;
    if (msg.line) {
        line = msg.line - 1;
    }
    else {
        line = 0;
    }
    let column;
    if (msg.column) {
        column = msg.column - 1;
    }
    else {
        column = 0;
    }
    let message;
    if (msg.message) {
        message = msg.message;
    }
    else {
        message = "Unknown error";
    }
    return {
        severity: severity,
        range: {
            start: { line: line, character: column },
            end: { line: line, character: column + 1 }
        },
        message: message,
        source: "sass-lint"
    };
}
function getErrorMessage(err, document) {
    let errorMessage = "unknown error";
    if (typeof err.message === "string" || err.message instanceof String) {
        errorMessage = err.message;
    }
    const fsPath = vscode_languageserver_1.Files.uriToFilePath(document.uri);
    const message = `vscode-sass-lint: '${errorMessage}' while validating: ${fsPath} stacktrace: ${err.stack}`;
    return message;
}
// The settings have changed. Sent on server activation as well.
connection.onDidChangeConfiguration((params) => {
    settings = params.settings;
    let newConfigFile = null;
    // Watch configFile specified in VS Code settings.
    if (settings.sasslint && settings.sasslint.configFile) {
        newConfigFile = settings.sasslint.configFile;
        try {
            // Check if the file can be read.
            fs.accessSync(newConfigFile, fs.constants.R_OK);
        }
        catch (e) {
            connection.window.showErrorMessage(`The file ${newConfigFile} referred to by 'sasslint.configFile' could not be read`);
            return;
        }
    }
    if (settingsConfigFile !== newConfigFile) {
        // Clear cache.
        configPathCache = {};
        // Stop watching the old config file.
        if (settingsConfigFileWatcher) {
            settingsConfigFileWatcher.close();
            settingsConfigFileWatcher = null;
        }
        // Start watching the new config file.
        if (newConfigFile) {
            settingsConfigFileWatcher = chokidar.watch(newConfigFile, { ignoreInitial: true, persistent: false });
            settingsConfigFileWatcher.on("all", () => {
                // Clear cache.
                configPathCache = {};
                validateAllTextDocuments(documents.all());
            });
        }
        settingsConfigFile = newConfigFile;
    }
    // Revalidate any open text documents.
    validateAllTextDocuments(documents.all());
});
connection.onDidChangeWatchedFiles(() => {
    // Clear cache.
    configPathCache = {};
    validateAllTextDocuments(documents.all());
});
// Listen on the connection.
connection.listen();
//# sourceMappingURL=server.js.map