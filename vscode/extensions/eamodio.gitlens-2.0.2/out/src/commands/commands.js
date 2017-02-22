'use strict';
const vscode_1 = require("vscode");
class Command extends vscode_1.Disposable {
    constructor(command) {
        super(() => this.dispose());
        this._disposable = vscode_1.commands.registerCommand(command, this.execute, this);
    }
    dispose() {
        this._disposable && this._disposable.dispose();
    }
}
exports.Command = Command;
class EditorCommand extends vscode_1.Disposable {
    constructor(command) {
        super(() => this.dispose());
        this._disposable = vscode_1.commands.registerTextEditorCommand(command, this.execute, this);
    }
    dispose() {
        this._disposable && this._disposable.dispose();
    }
}
exports.EditorCommand = EditorCommand;
//# sourceMappingURL=commands.js.map