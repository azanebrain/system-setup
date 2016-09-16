'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require('vscode');
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "vscode-smart-split-into-lines" is now active!');
    context.subscriptions.push(vscode.commands.registerCommand('smart.splitIntoLines', function () {
        var textEditor = vscode.window.activeTextEditor;
        var selection = textEditor.selection;
        if (!selection.isEmpty) {
            var document = textEditor.document;
            var selections = new Array();
            // Para cada linha selecionada
            for (var i = selection.start.line; i <= selection.end.line; i++) {
                // Inserir o cursor em cada linha sempre no final da linha
                if (i !== selection.end.line) {
                    var position = new vscode.Position(i, document.lineAt(i).range.end.character);
                    selections.push(new vscode.Selection(position, position));
                }
                else if (selection.end.character > 0) {
                    selections.push(new vscode.Selection(selection.end, selection.end));
                }
            }
            // Coloca o que foi feito no editor e pronto, valeu falows...
            textEditor.selections = selections;
        }
    }));
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map