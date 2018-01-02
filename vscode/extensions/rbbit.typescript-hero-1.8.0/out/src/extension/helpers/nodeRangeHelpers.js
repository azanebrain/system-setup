"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
function nodeRange(document, start, end) {
    return start !== undefined && end !== undefined ?
        new vscode_1.Range(document.positionAt(start), document.positionAt(end)) :
        new vscode_1.Range(new vscode_1.Position(0, 0), new vscode_1.Position(0, 0));
}
exports.nodeRange = nodeRange;
function importRange(document, start, end) {
    return start !== undefined && end !== undefined ?
        new vscode_1.Range(document.lineAt(document.positionAt(start).line).rangeIncludingLineBreak.start, document.lineAt(document.positionAt(end).line).rangeIncludingLineBreak.end) :
        new vscode_1.Range(new vscode_1.Position(0, 0), new vscode_1.Position(0, 0));
}
exports.importRange = importRange;
