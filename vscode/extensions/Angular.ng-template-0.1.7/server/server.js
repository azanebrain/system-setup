"use strict";
/* --------------------------------------------------------------------------------------------
 * Portions Copyright (c) Microsoft Corporation. All rights reserved.
 * Portions Copyright (c) Google Inc. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path="../node_modules/@types/node/index.d.ts" />
// Force TypeScript to use the non-polling version of the file watchers.
process.env["TSC_NONPOLLING_WATCHER"] = true;
var vscode_languageserver_1 = require("vscode-languageserver");
var documents_1 = require("./documents");
var errors_1 = require("./errors");
// Create a connection for the server. The connection uses Node's IPC as a transport
var connection = vscode_languageserver_1.createConnection();
// Create a simple text document manager. The text document manager
// supports full document sync only
var documents = new documents_1.TextDocuments(handleTextEvent);
// Setup the error collector that watches for document events and requests errors
// reported back to the client
var errorCollector = new errors_1.ErrorCollector(documents, connection);
function handleTextEvent(event) {
    switch (event.kind) {
        case 'context':
        case 'change':
        case 'opened':
            errorCollector.requestErrors(event.document);
    }
}
// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);
// After the server has started the client sends an initilize request. The server receives
// in the passed params the rootPath of the workspace plus the client capabilites.
var workspaceRoot;
connection.onInitialize(function (params) {
    workspaceRoot = params.rootPath;
    return {
        capabilities: {
            // Tell the client that the server works in FULL text document sync mode
            textDocumentSync: documents.syncKind,
            // Tell the client that the server support code complete
            completionProvider: {
                resolveProvider: false,
                triggerCharacters: ['<', '.', '*', '[', '(']
            },
            definitionProvider: true,
            hoverProvider: true
        }
    };
});
function compiletionKindToCompletionItemKind(kind) {
    switch (kind) {
        case 'attribute': return vscode_languageserver_1.CompletionItemKind.Property;
        case 'html attribute': return vscode_languageserver_1.CompletionItemKind.Property;
        case 'component': return vscode_languageserver_1.CompletionItemKind.Class;
        case 'element': return vscode_languageserver_1.CompletionItemKind.Class;
        case 'entity': return vscode_languageserver_1.CompletionItemKind.Text;
        case 'key': return vscode_languageserver_1.CompletionItemKind.Class;
        case 'method': return vscode_languageserver_1.CompletionItemKind.Method;
        case 'pipe': return vscode_languageserver_1.CompletionItemKind.Function;
        case 'property': return vscode_languageserver_1.CompletionItemKind.Property;
        case 'type': return vscode_languageserver_1.CompletionItemKind.Interface;
        case 'reference': return vscode_languageserver_1.CompletionItemKind.Variable;
        case 'variable': return vscode_languageserver_1.CompletionItemKind.Variable;
    }
    return vscode_languageserver_1.CompletionItemKind.Text;
}
var wordRe = /(\w|\(|\)|\[|\]|\*|\-|\_|\.)+/g;
var special = /\(|\)|\[|\]|\*|\-|\_|\./;
// Convert attribute names with non-\w chracters into a text edit.
function insertionToEdit(range, insertText) {
    if (insertText.match(special) && range) {
        return vscode_languageserver_1.TextEdit.replace(range, insertText);
    }
}
function getReplaceRange(document, offset) {
    var line = documents.getDocumentLine(document, offset);
    if (line && line.text && line.start <= offset && line.start + line.text.length >= offset) {
        var lineOffset_1 = offset - line.start - 1;
        // Find the word that contains the offset
        var found_1, len_1;
        line.text.replace(wordRe, (function (word, _, wordOffset) {
            if (wordOffset <= lineOffset_1 && wordOffset + word.length >= lineOffset_1 && word.match(special)) {
                found_1 = wordOffset;
                len_1 = word.length;
            }
        }));
        if (found_1 != null) {
            return vscode_languageserver_1.Range.create(vscode_languageserver_1.Position.create(line.line - 1, found_1), vscode_languageserver_1.Position.create(line.line - 1, found_1 + len_1));
        }
    }
}
function insertTextOf(completion) {
    switch (completion.kind) {
        case 'attribute':
        case 'html attribute':
            return completion.name + "=";
    }
    return completion.name;
}
// This handler provides the initial list of the completion items.
connection.onCompletion(function (textDocumentPosition) {
    var _a = documents.getServiceInfo(textDocumentPosition.textDocument, textDocumentPosition.position), fileName = _a.fileName, service = _a.service, offset = _a.offset, languageId = _a.languageId;
    if (fileName && service && offset != null) {
        var result = service.getCompletionsAt(fileName, offset);
        if (result && languageId == 'html') {
            // The HTML elements are provided by the HTML service when the text type is 'html'.
            result = result.filter(function (completion) { return completion.kind != 'element'; });
        }
        if (result) {
            var replaceRange_1 = getReplaceRange(textDocumentPosition.textDocument, offset);
            return result.map(function (completion) { return ({
                label: completion.name,
                kind: compiletionKindToCompletionItemKind(completion.kind),
                detail: completion.kind,
                sortText: completion.sort,
                textEdit: insertionToEdit(replaceRange_1, insertTextOf(completion)),
                insertText: insertTextOf(completion)
            }); });
        }
    }
});
function ngDefintionToDefintion(definition) {
    var locations = definition.map(function (d) {
        var document = vscode_languageserver_1.TextDocumentIdentifier.create(documents_1.fileNameToUri(d.fileName));
        var positions = documents.offsetsToPositions(document, [d.span.start, d.span.end]);
        return { document: document, positions: positions };
    }).filter(function (d) { return d.positions.length > 0; }).map(function (d) {
        var range = vscode_languageserver_1.Range.create(d.positions[0], d.positions[1]);
        return vscode_languageserver_1.Location.create(d.document.uri, range);
    });
    if (locations && locations.length) {
        return locations;
    }
}
function logErrors(f) {
    try {
        return f();
    }
    catch (e) {
        if (e.message && e.stack)
            connection.console.error("SERVER ERROR: " + e.message + "\n" + e.stack);
        throw e;
    }
}
connection.onDefinition(function (textDocumentPosition) { return logErrors(function () {
    var _a = documents.getServiceInfo(textDocumentPosition.textDocument, textDocumentPosition.position), fileName = _a.fileName, service = _a.service, offset = _a.offset, languageId = _a.languageId;
    if (fileName && service && offset != null) {
        var result = service.getDefinitionAt(fileName, offset);
        if (result) {
            return ngDefintionToDefintion(result);
        }
    }
}); });
function ngHoverToHover(hover, document) {
    if (hover) {
        var positions = documents.offsetsToPositions(document, [hover.span.start, hover.span.end]);
        if (positions) {
            var range = vscode_languageserver_1.Range.create(positions[0], positions[1]);
            return {
                contents: { language: 'typescript', value: hover.text.map(function (t) { return t.text; }).join('') },
                range: range
            };
        }
    }
}
connection.onHover(function (textDocumentPosition) { return logErrors(function () {
    var _a = documents.getServiceInfo(textDocumentPosition.textDocument, textDocumentPosition.position), fileName = _a.fileName, service = _a.service, offset = _a.offset, languageId = _a.languageId;
    if (fileName && service && offset != null) {
        var result = service.getHoverAt(fileName, offset);
        if (result) {
            return ngHoverToHover(result, textDocumentPosition.textDocument);
        }
    }
}); });
// Listen on the connection
connection.listen();
//# sourceMappingURL=server.js.map