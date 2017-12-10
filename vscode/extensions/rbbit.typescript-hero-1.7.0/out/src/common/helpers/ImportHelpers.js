"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
function getImportInsertPosition(editor) {
    if (!editor) {
        return new vscode_1.Position(0, 0);
    }
    const lines = editor.document.getText().split('\n');
    const index = lines.findIndex(line => !line.match(/^\s*(\/\/|\/\*\*|\*\/|\*|['"]use strict['"])/g));
    return new vscode_1.Position(Math.max(0, index), 0);
}
exports.getImportInsertPosition = getImportInsertPosition;
