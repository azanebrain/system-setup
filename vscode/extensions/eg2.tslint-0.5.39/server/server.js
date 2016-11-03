/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';
var minimatch = require('minimatch');
var server = require('vscode-languageserver');
var fs = require('fs');
var autofix = require('./tslintAutoFix');
var delayer_1 = require('./delayer');
var ID = (function () {
    function ID() {
    }
    ID.next = function () {
        return "" + ID.base + ID.counter++;
    };
    ID.base = Date.now().toString() + "-";
    ID.counter = 0;
    return ID;
}());
function computeKey(diagnostic) {
    var range = diagnostic.range;
    return "[" + range.start.line + "," + range.start.character + "," + range.end.line + "," + range.end.character + "]-" + diagnostic.code;
}
var Status;
(function (Status) {
    Status[Status["ok"] = 1] = "ok";
    Status[Status["warn"] = 2] = "warn";
    Status[Status["error"] = 3] = "error";
})(Status || (Status = {}));
var StatusNotification;
(function (StatusNotification) {
    StatusNotification.type = { get method() { return 'tslint/status'; } };
})(StatusNotification || (StatusNotification = {}));
var settings = null;
var linter = null;
var validationDelayer = Object.create(null); // key is the URI of the document
var tslintNotFound = "Failed to load tslint library. Please install tslint in your workspace\nfolder using 'npm install tslint' or 'npm install -g tslint' and then press Retry.";
// Options passed to tslint
var options = {
    formatter: "json",
    configuration: {},
    rulesDirectory: undefined,
    formattersDirectory: undefined
};
var configFile = null;
var configFileWatcher = null;
var configCache = {
    filePath: null,
    configuration: null,
    isDefaultConfig: false
};
function makeDiagnostic(problem) {
    var diagnostic = {
        severity: 2 /* Warning */,
        message: problem.failure,
        range: {
            start: {
                line: problem.startPosition.line,
                character: problem.startPosition.character
            },
            end: {
                line: problem.endPosition.line,
                character: problem.endPosition.character
            },
        },
        code: problem.ruleName,
        source: 'tslint'
    };
    return diagnostic;
}
var codeActions = Object.create(null);
function recordCodeAction(document, diagnostic, problem) {
    var afix = autofix.tsLintAutoFixes.filter(function (autoFix) { return autoFix.tsLintMessage.toLowerCase() === problem.failure.toLocaleLowerCase(); });
    if (afix.length > 0) {
        // create an autoFixEntry for the document in the codeActions
        var uri = document.uri;
        var edits = codeActions[uri];
        if (!edits) {
            edits = Object.create(null);
            codeActions[uri] = edits;
        }
        /** temporary variable for debugging purpose
         * it's not possible to use console.log to trace the autofx rules.
         * so uncomment the following variable put a break point on the line and check in/out of autofix rules
        */
        // let debugCodeBefore = document.getText().slice(problem.startPosition.position, problem.endPosition.position);
        // let debugCodeAfter = afix[0].autoFix(document.getText().slice(problem.startPosition.position, problem.endPosition.position));
        edits[computeKey(diagnostic)] = {
            label: "Fix this \"" + problem.failure + "\" tslint failure?",
            documentVersion: document.version,
            ruleId: problem.failure,
            edit: {
                range: [problem.startPosition, problem.endPosition],
                text: afix[0].autoFix(document.getText().slice(problem.startPosition.position, problem.endPosition.position))
            }
        };
    }
}
function getConfiguration(filePath, configFileName) {
    if (configCache.configuration && configCache.filePath === filePath) {
        return configCache.configuration;
    }
    var isDefaultConfig = false;
    if (linter.findConfigurationPath) {
        isDefaultConfig = linter.findConfigurationPath(configFileName, filePath) === undefined;
    }
    configCache = {
        filePath: filePath,
        isDefaultConfig: isDefaultConfig,
        configuration: linter.findConfiguration(configFileName, filePath)
    };
    return configCache.configuration;
}
function flushConfigCache() {
    configCache = {
        filePath: null,
        configuration: null,
        isDefaultConfig: false
    };
}
function getErrorMessage(err, document) {
    var errorMessage = "unknown error";
    if (typeof err.message === 'string' || err.message instanceof String) {
        errorMessage = err.message;
    }
    var fsPath = server.Files.uriToFilePath(document.uri);
    var message = "vscode-tslint: '" + errorMessage + "' while validating: " + fsPath + " stacktrace: " + err.stack;
    return message;
}
function getConfigurationFailureMessage(err) {
    var errorMessage = "unknown error";
    if (typeof err.message === 'string' || err.message instanceof String) {
        errorMessage = err.message;
    }
    return "vscode-tslint: Cannot read tslint configuration - '" + errorMessage + "'";
}
function showConfigurationFailure(conn, err) {
    var message = getConfigurationFailureMessage(err);
    conn.window.showInformationMessage(message);
}
function validateAllTextDocuments(connection, documents) {
    var tracker = new server.ErrorMessageTracker();
    documents.forEach(function (document) {
        try {
            validateTextDocument(connection, document);
        }
        catch (err) {
            tracker.add(getErrorMessage(err, document));
        }
    });
    tracker.sendErrors(connection);
}
function validateTextDocument(connection, document) {
    try {
        var uri = document.uri;
        var diagnostics = doValidate(connection, document);
        connection.sendDiagnostics({ uri: uri, diagnostics: diagnostics });
    }
    catch (err) {
        connection.window.showErrorMessage(getErrorMessage(err, document));
    }
}
var connection = server.createConnection(process.stdin, process.stdout);
var documents = new server.TextDocuments();
documents.listen(connection);
function trace(message, verbose) {
    connection.tracer.log(message, verbose);
}
connection.onInitialize(function (params) {
    var rootFolder = params.rootPath;
    var initOptions = params.initializationOptions;
    var nodePath = initOptions ? (initOptions.nodePath ? initOptions.nodePath : undefined) : undefined;
    return server.Files.resolveModule2(rootFolder, 'tslint', nodePath, trace).
        then(function (value) {
        linter = value;
        var result = { capabilities: { textDocumentSync: documents.syncKind, codeActionProvider: true } };
        return result;
    }, function (error) {
        // We only want to show the tslint load failed error, when the workspace is configured for tslint.
        // However, only tslint knows whether a config file exists, but since we cannot load it we cannot ask it.
        // For now we hard code a common case and only show the error in this case.
        if (fs.existsSync('tslint.json')) {
            return Promise.reject(new server.ResponseError(99, tslintNotFound, { retry: true }));
        }
        // Respond that initialization failed silently, without prompting the user.
        return Promise.reject(new server.ResponseError(100, null, // do not show an error message
        { retry: false }));
    });
});
function doValidate(conn, document) {
    var uri = document.uri;
    var diagnostics = [];
    // Clean previously computed code actions.
    delete codeActions[uri];
    var fsPath = server.Files.uriToFilePath(uri);
    if (!fsPath) {
        // tslint can only lint files on disk
        return diagnostics;
    }
    if (fileIsExcluded(fsPath)) {
        return diagnostics;
    }
    var contents = document.getText();
    try {
        options.configuration = getConfiguration(fsPath, configFile);
    }
    catch (err) {
        // this should not happen since we guard against incorrect configurations
        showConfigurationFailure(conn, err);
        return diagnostics;
    }
    if (settings && settings.tslint && settings.tslint.validateWithDefaultConfig === false && configCache.isDefaultConfig) {
        return diagnostics;
    }
    if (configCache.isDefaultConfig && settings.tslint.validateWithDefaultConfig === false) {
        return;
    }
    var result;
    try {
        var tslint = new linter(fsPath, contents, options);
        result = tslint.lint();
    }
    catch (err) {
        // TO DO show an indication in the workbench
        conn.console.info(getErrorMessage(err, document));
        connection.sendNotification(StatusNotification.type, { state: Status.error });
        return diagnostics;
    }
    if (result.failureCount > 0) {
        var lintProblems = JSON.parse(result.output);
        lintProblems.forEach(function (problem) {
            var diagnostic = makeDiagnostic(problem);
            diagnostics.push(diagnostic);
            recordCodeAction(document, diagnostic, problem);
        });
    }
    connection.sendNotification(StatusNotification.type, { state: Status.ok });
    return diagnostics;
}
function fileIsExcluded(path) {
    function testForExclusionPattern(path, pattern) {
        return minimatch(path, pattern);
    }
    if (settings && settings.tslint) {
        if (settings.tslint.ignoreDefinitionFiles) {
            if (minimatch(path, "**/*.d.ts")) {
                return true;
            }
        }
        if (settings.tslint.exclude) {
            if (Array.isArray(settings.tslint.exclude)) {
                for (var _i = 0, _a = settings.tslint.exclude; _i < _a.length; _i++) {
                    var pattern = _a[_i];
                    if (testForExclusionPattern(path, pattern)) {
                        return true;
                    }
                }
            }
            else if (testForExclusionPattern(path, settings.tslint.exclude)) {
                return true;
            }
        }
    }
}
// A text document has changed. Validate the document.
documents.onDidChangeContent(function (event) {
    if (settings.tslint.run === 'onType') {
        triggerValidateDocument(event.document);
    }
});
documents.onDidSave(function (event) {
    if (settings.tslint.run === 'onSave') {
        triggerValidateDocument(event.document);
    }
});
// A text document was closed. Clear the diagnostics .
documents.onDidClose(function (event) {
    connection.sendDiagnostics({ uri: event.document.uri, diagnostics: [] });
});
function triggerValidateDocument(document) {
    var d = validationDelayer[document.uri];
    if (!d) {
        d = new delayer_1.Delayer(200);
        validationDelayer[document.uri] = d;
    }
    d.trigger(function () {
        validateTextDocument(connection, document);
        delete validationDelayer[document.uri];
    });
}
function tslintConfigurationValid() {
    try {
        documents.all().forEach(function (each) {
            var fsPath = server.Files.uriToFilePath(each.uri);
            if (fsPath) {
                getConfiguration(fsPath, configFile);
            }
        });
    }
    catch (err) {
        connection.console.info(getConfigurationFailureMessage(err));
        connection.sendNotification(StatusNotification.type, { state: Status.error });
        return false;
    }
    return true;
}
// The VS Code tslint settings have changed. Revalidate all documents.
connection.onDidChangeConfiguration(function (params) {
    flushConfigCache();
    settings = params.settings;
    if (settings.tslint) {
        options.rulesDirectory = settings.tslint.rulesDirectory || null;
        var newConfigFile = settings.tslint.configFile || null;
        if (configFile !== newConfigFile) {
            if (configFileWatcher) {
                configFileWatcher.close();
                configFileWatcher = null;
            }
            if (!fs.existsSync(newConfigFile)) {
                connection.window.showWarningMessage("The file " + newConfigFile + " refered to by 'tslint.configFile' does not exist");
                configFile = null;
                return;
            }
            configFile = newConfigFile;
            if (configFile) {
                configFileWatcher = fs.watch(configFile, { persistent: false }, function (event, fileName) {
                    validateAllTextDocuments(connection, documents.all());
                });
            }
        }
    }
    validateAllTextDocuments(connection, documents.all());
});
// The watched tslint.json has changed. Revalidate all documents, IF the configuration is valid.
connection.onDidChangeWatchedFiles(function (params) {
    // Tslint 3.7 started to load configuration files using 'require' and they are now
    // cached in the node module cache. To ensure that the extension uses
    // the latest configuration file we remove the config file from the module cache.
    params.changes.forEach(function (element) {
        var configFilePath = server.Files.uriToFilePath(element.uri);
        var cached = require.cache[configFilePath];
        if (cached) {
            delete require.cache[configFilePath];
        }
    });
    flushConfigCache();
    if (tslintConfigurationValid()) {
        validateAllTextDocuments(connection, documents.all());
    }
});
connection.onCodeAction(function (params) {
    var result = [];
    var uri = params.textDocument.uri;
    var edits = codeActions[uri];
    var documentVersion = -1;
    var ruleId;
    // function createTextEdit(editInfo: AutoFix): server.TextEdit {
    // 	return server.TextEdit.replace(
    // 		server.Range.create(
    // 			editInfo.edit.range[0],
    // 			editInfo.edit.range[1]),
    // 		editInfo.edit.text || '');
    // }
    if (edits) {
        for (var _i = 0, _a = params.context.diagnostics; _i < _a.length; _i++) {
            var diagnostic = _a[_i];
            var key = computeKey(diagnostic);
            var editInfo = edits[key];
            if (editInfo) {
                documentVersion = editInfo.documentVersion;
                ruleId = editInfo.ruleId;
                result.push(server.Command.create(editInfo.label, 'tslint.applySingleFix', uri, documentVersion, [
                    createTextEdit(editInfo)
                ]));
            }
        }
        if (result.length > 0) {
            var same = [];
            var all = [];
            var fixes = Object.keys(edits).map(function (key) { return edits[key]; });
            // TODO from eslint: why? order the fixes for? overlap?
            // fixes = fixes.sort((a, b) => {
            // 	let d = a.edit.range[0] - b.edit.range[0];
            // 	if (d !== 0) {
            // 		return d;
            // 	}
            // 	if (a.edit.range[1] === 0) {
            // 		return -1;
            // 	}
            // 	if (b.edit.range[1] === 0) {
            // 		return 1;
            // 	}
            // 	return a.edit.range[1] - b.edit.range[1];
            // });
            // check if there are fixes overlaps
            function overlaps(lastEdit, newEdit) {
                return !!lastEdit && lastEdit.edit.range[1] > newEdit.edit.range[0];
            }
            function getLastEdit(array) {
                var length = array.length;
                if (length === 0) {
                    return undefined;
                }
                return array[length - 1];
            }
            for (var _b = 0, fixes_1 = fixes; _b < fixes_1.length; _b++) {
                var editInfo = fixes_1[_b];
                if (documentVersion === -1) {
                    documentVersion = editInfo.documentVersion;
                }
                if (editInfo.ruleId === ruleId && !overlaps(getLastEdit(same), editInfo)) {
                    same.push(editInfo);
                }
                if (!overlaps(getLastEdit(all), editInfo)) {
                    all.push(editInfo);
                }
            }
            // if there several time the same rule identified => propose to fix all
            if (same.length > 1) {
                result.push(server.Command.create("Fix all \"" + same[0].ruleId + "\" tslint failures?", 'tslint.applySameFixes', uri, documentVersion, same.map(createTextEdit)));
            }
            // propose to fix all
            if (all.length > 1) {
                result.push(server.Command.create("Fix all auto-fixable problems", 'tslint.applyAllFixes', uri, documentVersion, all.map(createTextEdit)));
            }
        }
    }
    return result;
});
function createTextEdit(editInfo) {
    return server.TextEdit.replace(server.Range.create(editInfo.edit.range[0], editInfo.edit.range[1]), editInfo.edit.text || '');
}
var AllFixesRequest;
(function (AllFixesRequest) {
    AllFixesRequest.type = { get method() { return 'textDocument/tslint/allFixes'; } };
})(AllFixesRequest || (AllFixesRequest = {}));
connection.onRequest(AllFixesRequest.type, function (params) {
    var result = null;
    var uri = params.textDocument.uri;
    var edits = codeActions[uri];
    var documentVersion = -1;
    // retrive document version
    var fixes = Object.keys(edits).map(function (key) { return edits[key]; });
    for (var _i = 0, fixes_2 = fixes; _i < fixes_2.length; _i++) {
        var fix = fixes_2[_i];
        if (documentVersion === -1) {
            documentVersion = fix.documentVersion;
            break;
        }
    }
    // convert autoFix in textEdits
    // let textEdits: server.TextEdit[] = fixes.map((fix) => {
    // 	let range  = server.Range.create(fix.edit.range[0], fix.edit.range[1]);
    // 	return server.TextEdit.replace( range , fix.edit.text);
    // });
    var textEdits = fixes.map(createTextEdit);
    result = {
        documentVersion: documentVersion,
        edits: textEdits
    };
    return result;
});
connection.listen();
//# sourceMappingURL=server.js.map