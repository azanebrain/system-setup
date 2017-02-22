'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const vscode_1 = require("vscode");
const commands_1 = require("./commands");
const constants_1 = require("../constants");
const logger_1 = require("../logger");
class ToggleBlameCommand extends commands_1.EditorCommand {
    constructor(annotationController) {
        super(constants_1.Commands.ToggleBlame);
        this.annotationController = annotationController;
    }
    execute(editor, edit, uri, sha) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (sha) {
                    return this.annotationController.toggleBlameAnnotation(editor, sha);
                }
                return this.annotationController.toggleBlameAnnotation(editor, editor.selection.active.line);
            }
            catch (ex) {
                logger_1.Logger.error('GitLens.ToggleBlameCommand', ex);
                return vscode_1.window.showErrorMessage(`Unable to show blame annotations. See output channel for more details`);
            }
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ToggleBlameCommand;
//# sourceMappingURL=toggleBlame.js.map