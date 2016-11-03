"use strict";
var vscode_languageserver_1 = require("vscode-languageserver");
var chokidar = require("chokidar");
var fs = require("fs");
var globule = require("globule");
var path = require("path");
// Create a connection for the server. The connection uses Node's IPC as a transport.
var connection = vscode_languageserver_1.createConnection(new vscode_languageserver_1.IPCMessageReader(process), new vscode_languageserver_1.IPCMessageWriter(process));
// Create a simple text document manager. The text document manager supports full document sync only.
var documents = new vscode_languageserver_1.TextDocuments();
// Make the text document manager listen on the connection for open, change, and close text document events.
documents.listen(connection);
var sassLint;
var settings;
var configPathCache = {};
var settingsConfigFile;
var settingsConfigFileWatcher = null;
var CONFIG_FILE_NAME = ".sass-lint.yml";
// After the server has started the client sends an initialize request.
// The server receives in the passed params the rootPath of the workspace plus the client capabilities.
var workspaceRoot;
connection.onInitialize(function (params) {
    workspaceRoot = params.rootPath;
    // Watch ".sass-lint.yml" files.
    var watcher = chokidar.watch("**/" + CONFIG_FILE_NAME, { ignoreInitial: true, persistent: false });
    watcher.on("all", function (event, filePath) {
        // Clear cache.
        configPathCache = {};
        validateAllTextDocuments(documents.all());
    });
    return vscode_languageserver_1.Files.resolveModule(workspaceRoot, "sass-lint").then(function (value) {
        sassLint = value;
        var result = {
            capabilities: {
                textDocumentSync: documents.syncKind
            }
        };
        return result;
    }, function (error) {
        return Promise.reject(new vscode_languageserver_1.ResponseError(99, "Failed to load sass-lint library. Please install sass-lint in your workspace folder using 'npm\n                    install sass-lint' or globally using 'npm install sass-lint -g' and then press Retry.", { retry: true }));
    });
});
// The content of a text document has changed.
// This event is emitted when the text document is first opened or when its content has changed.
documents.onDidChangeContent(function (change) {
    if (settings.sasslint.run === "onType") {
        validateTextDocument(change.document);
    }
});
documents.onDidSave(function (event) {
    if (settings.sasslint.run === "onSave") {
        validateTextDocument(event.document);
    }
});
// A text document was closed. Clear the diagnostics.
documents.onDidClose(function (event) {
    connection.sendDiagnostics({ uri: event.document.uri, diagnostics: [] });
});
function validateTextDocument(textDocument) {
    var filePath = vscode_languageserver_1.Files.uriToFilePath(textDocument.uri);
    if (!filePath) {
        // Sass Lint can only lint files on disk.
        return;
    }
    var diagnostics = [];
    var configFile = getConfigFile(filePath);
    var compiledConfig = sassLint.getConfig({}, configFile);
    var relativePath = getFilePath(filePath, configFile);
    if (globule.isMatch(compiledConfig.files.include, relativePath) &&
        !globule.isMatch(compiledConfig.files.ignore, relativePath)) {
        var result = sassLint.lintText({
            text: textDocument.getText(),
            format: path.extname(filePath).slice(1),
            filename: filePath
        }, {}, configFile);
        for (var _i = 0, _a = result.messages; _i < _a.length; _i++) {
            var msg = _a[_i];
            diagnostics.push(makeDiagnostic(msg));
        }
    }
    // Send the computed diagnostics to VSCode.
    connection.sendDiagnostics({ uri: textDocument.uri, diagnostics: diagnostics });
}
function validateAllTextDocuments(textDocuments) {
    var tracker = new vscode_languageserver_1.ErrorMessageTracker();
    for (var _i = 0, textDocuments_1 = textDocuments; _i < textDocuments_1.length; _i++) {
        var document_1 = textDocuments_1[_i];
        try {
            validateTextDocument(document_1);
        }
        catch (err) {
            tracker.add(getErrorMessage(err, document_1));
        }
    }
    tracker.sendErrors(connection);
}
function getConfigFile(filePath) {
    var dirName = path.dirname(filePath);
    var configFile = configPathCache[dirName];
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
    var parent = directory;
    do {
        directory = parent;
        var location_1 = path.join(directory, fileName);
        try {
            fs.accessSync(location_1, fs.R_OK);
            return location_1;
        }
        catch (e) {
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
    var severity;
    switch (msg.severity) {
        case 1:
            severity = 2 /* Warning */;
            break;
        case 2:
            severity = 1 /* Error */;
            break;
        default:
            severity = 3 /* Information */;
            break;
    }
    var line;
    if (msg.line) {
        line = msg.line - 1;
    }
    else {
        line = 0;
    }
    var column;
    if (msg.column) {
        column = msg.column - 1;
    }
    else {
        column = 0;
    }
    var message;
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
    var errorMessage = "unknown error";
    if (typeof err.message === "string" || err.message instanceof String) {
        errorMessage = err.message;
    }
    var fsPath = vscode_languageserver_1.Files.uriToFilePath(document.uri);
    var message = "vscode-sass-lint: '" + errorMessage + "' while validating: " + fsPath + " stacktrace: " + err.stack;
    return message;
}
// The settings have changed. Sent on server activation as well.
connection.onDidChangeConfiguration(function (params) {
    settings = params.settings;
    var newConfigFile = null;
    // Watch configFile specified in VS Code settings.
    if (settings.sasslint && settings.sasslint.configFile) {
        newConfigFile = settings.sasslint.configFile;
        try {
            // Check if the file can be read.
            fs.accessSync(newConfigFile, fs.R_OK);
        }
        catch (e) {
            connection.window.showErrorMessage("The file " + newConfigFile + " referred to by 'sasslint.configFile' could not be read");
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
            settingsConfigFileWatcher.on("all", function (event, filePath) {
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
// Listen on the connection.
connection.listen();
//# sourceMappingURL=server.js.map