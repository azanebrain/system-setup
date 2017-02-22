'use strict';
const commands_1 = require("./commands");
const constants_1 = require("../constants");
class ToggleCodeLensCommand extends commands_1.EditorCommand {
    constructor(git) {
        super(constants_1.Commands.ToggleCodeLens);
        this.git = git;
    }
    execute(editor, edit) {
        return this.git.toggleCodeLens(editor);
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ToggleCodeLensCommand;
//# sourceMappingURL=toggleCodeLens.js.map