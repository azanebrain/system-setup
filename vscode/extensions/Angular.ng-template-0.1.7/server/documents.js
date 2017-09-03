"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
var url = require("url");
var vscode_languageserver_1 = require("vscode-languageserver");
var editorServices_1 = require("./editorServices");
// Delegate project service host to TypeScript's sys implementation
var ProjectServiceHostImpl = (function () {
    function ProjectServiceHostImpl() {
    }
    ProjectServiceHostImpl.prototype.getCurrentDirectory = function () {
        return ts.sys.getCurrentDirectory();
    };
    ProjectServiceHostImpl.prototype.readFile = function (path, encoding) {
        return ts.sys.readFile(path, encoding);
    };
    ProjectServiceHostImpl.prototype.directoryExists = function (path) {
        return ts.sys.directoryExists(path);
    };
    ProjectServiceHostImpl.prototype.getExecutingFilePath = function () {
        return ts.sys.getExecutingFilePath();
    };
    ProjectServiceHostImpl.prototype.resolvePath = function (path) {
        return ts.sys.resolvePath(path);
    };
    ProjectServiceHostImpl.prototype.fileExists = function (path) {
        return ts.sys.fileExists(path);
    };
    ProjectServiceHostImpl.prototype.getDirectories = function (path) {
        return ts.sys.getDirectories(path);
    };
    ProjectServiceHostImpl.prototype.watchDirectory = function (path, callback, recursive) {
        return ts.sys.watchDirectory(path, callback, recursive);
    };
    ProjectServiceHostImpl.prototype.watchFile = function (path, callback) {
        return ts.sys.watchFile(path, callback);
    };
    ProjectServiceHostImpl.prototype.readDirectory = function (path, extensions, exclude, include) {
        return ts.sys.readDirectory(path, extensions, exclude, include);
    };
    Object.defineProperty(ProjectServiceHostImpl.prototype, "useCaseSensitiveFileNames", {
        get: function () {
            return ts.sys.useCaseSensitiveFileNames;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ProjectServiceHostImpl.prototype, "newLine", {
        get: function () {
            return ts.sys.newLine;
        },
        enumerable: true,
        configurable: true
    });
    ProjectServiceHostImpl.prototype.setTimeout = function (callback, ms) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        return setTimeout.apply(void 0, [callback, ms].concat(args));
    };
    ProjectServiceHostImpl.prototype.clearTimeout = function (timeoutId) {
        return clearTimeout(timeoutId);
    };
    return ProjectServiceHostImpl;
}());
var ProjectLoggerImpl = (function () {
    function ProjectLoggerImpl() {
    }
    ProjectLoggerImpl.prototype.connect = function (console) {
        this.console = console;
    };
    ProjectLoggerImpl.prototype.close = function () {
        this.console = null;
    };
    ProjectLoggerImpl.prototype.isVerbose = function () {
        return false;
    };
    ProjectLoggerImpl.prototype.info = function (s) {
        if (this.console)
            this.console.info(s);
    };
    ProjectLoggerImpl.prototype.startGroup = function () { };
    ProjectLoggerImpl.prototype.endGroup = function () { };
    ProjectLoggerImpl.prototype.msg = function (s, type) {
        if (this.console)
            this.console.log(s);
    };
    return ProjectLoggerImpl;
}());
function uriToFileName(uri) {
    var parsedUrl = url.parse(uri);
    switch (parsedUrl.protocol) {
        case 'file:':
        case 'private:':
            var result = unescape(parsedUrl.path);
            if (result.match(/^\/\w:/)) {
                result = result.substr(1);
            }
            return result;
    }
}
var fileProtocol = "file://";
function fileNameToUri(fileName) {
    if (fileName.match(/^\w:/)) {
        fileName = '/' + fileName;
    }
    return fileProtocol + escape(fileName);
}
exports.fileNameToUri = fileNameToUri;
var TextDocuments = (function () {
    function TextDocuments(event) {
        this.event = event;
        this.languageIds = new Map();
        this.changeNumber = 0;
        this.logger = new ProjectLoggerImpl();
        this.host = new ProjectServiceHostImpl();
        this.projectService = new editorServices_1.ProjectService(this.host, this.logger, this.handleProjectEvent.bind(this));
    }
    Object.defineProperty(TextDocuments.prototype, "syncKind", {
        get: function () {
            return vscode_languageserver_1.TextDocumentSyncKind.Incremental;
        },
        enumerable: true,
        configurable: true
    });
    TextDocuments.prototype.listen = function (connection) {
        var _this = this;
        // Connect the logger to the connection
        this.logger.connect(connection.console);
        connection.onDidOpenTextDocument(function (event) { return _this.logErrors(function () {
            // An interersting text document was opened in the client. Inform TypeScirpt's project services about it.
            var file = uriToFileName(event.textDocument.uri);
            if (file) {
                var _a = _this.projectService.openClientFile(file, event.textDocument.text), configFileName = _a.configFileName, configFileErrors = _a.configFileErrors;
                if (configFileErrors && configFileErrors.length) {
                    // TODO: Report errors
                    _this.logger.msg("Config errors encountered and need to be reported: " + configFileErrors.length + "\n  " + configFileErrors.map(function (error) { return error.messageText; }).join('\n  '));
                }
                _this.languageIds.set(event.textDocument.uri, event.textDocument.languageId);
            }
        }); });
        connection.onDidCloseTextDocument(function (event) { return _this.logErrors(function () {
            var file = uriToFileName(event.textDocument.uri);
            if (file) {
                _this.projectService.closeClientFile(file);
            }
        }); });
        connection.onDidChangeTextDocument(function (event) { return _this.logErrors(function () {
            var file = uriToFileName(event.textDocument.uri);
            if (file) {
                var positions_1 = _this.projectService.lineOffsetsToPositions(file, (_a = []).concat.apply(_a, event.contentChanges.map(function (change) { return [{
                        // VSCode is 0 based, editor services is 1 based.
                        line: change.range.start.line + 1,
                        col: change.range.start.character + 1
                    }, {
                        line: change.range.end.line + 1,
                        col: change.range.end.character + 1
                    }]; })));
                if (positions_1) {
                    _this.changeNumber++;
                    var mappedChanges = event.contentChanges.map(function (change, i) {
                        var start = positions_1[i * 2];
                        var end = positions_1[i * 2 + 1];
                        return { start: start, end: end, insertText: change.text };
                    });
                    _this.projectService.clientFileChanges(file, mappedChanges);
                    _this.changeNumber++;
                }
            }
            var _a;
        }); });
        connection.onDidSaveTextDocument(function (event) { return _this.logErrors(function () {
            // If the file is saved, force the content to be reloaded from disk as the content might have changed on save.
            _this.changeNumber++;
            var file = uriToFileName(event.textDocument.uri);
            if (file) {
                var savedContent = _this.host.readFile(file);
                _this.projectService.closeClientFile(file);
                _this.projectService.openClientFile(file, savedContent);
                _this.changeNumber++;
            }
        }); });
    };
    TextDocuments.prototype.offsetsToPositions = function (document, offsets) {
        var file = uriToFileName(document.uri);
        if (file) {
            var lineOffsets = this.projectService.positionsToLineOffsets(file, offsets);
            if (lineOffsets) {
                return lineOffsets.map(function (lineOffset) { return vscode_languageserver_1.Position.create(lineOffset.line - 1, lineOffset.col - 1); });
            }
        }
        return [];
    };
    TextDocuments.prototype.getDocumentLine = function (document, offset) {
        var info = this.getServiceInfo(document);
        if (info) {
            var lineInfo = this.projectService.positionToLineOffset(info.fileName, offset);
            if (lineInfo) {
                return { line: lineInfo.line, start: offset - lineInfo.offset, text: lineInfo.text };
            }
        }
    };
    TextDocuments.prototype.getNgService = function (document) {
        return this.getServiceInfo(document).service;
    };
    TextDocuments.prototype.getServiceInfo = function (document, position) {
        var fileName = uriToFileName(document.uri);
        if (fileName) {
            var project = this.projectService.getProjectForFile(fileName);
            var languageId = this.languageIds.get(document.uri);
            if (project) {
                var service = project.compilerService.ngService;
                if (position) {
                    // VSCode is 0 based, editor services are 1 based.
                    var offset = this.projectService.lineOffsetsToPositions(fileName, [{ line: position.line + 1, col: position.character + 1 }])[0];
                    return { fileName: fileName, service: service, offset: offset, languageId: languageId };
                }
                return { fileName: fileName, service: service, languageId: languageId };
            }
            return { fileName: fileName, languageId: languageId };
        }
        return {};
    };
    TextDocuments.prototype.ifUnchanged = function (f) {
        var _this = this;
        var currentChange = this.changeNumber;
        return function () {
            if (currentChange == _this.changeNumber)
                f();
        };
    };
    TextDocuments.prototype.logErrors = function (f) {
        try {
            f();
        }
        catch (e) {
            if (e.message && e.stack)
                this.logger.msg("SERVER ERROR: " + e.message + "\n" + e.stack);
            throw e;
        }
    };
    TextDocuments.prototype.handleProjectEvent = function (event) {
        if (this.event) {
            switch (event.eventName) {
                case 'context':
                case 'opened':
                case 'closed':
                case 'change':
                    this.event({ kind: event.eventName, document: { uri: fileNameToUri(event.data.fileName) } });
            }
        }
    };
    return TextDocuments;
}());
exports.TextDocuments = TextDocuments;
//# sourceMappingURL=documents.js.map