'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const common_1 = require("./common");
const logger_1 = require("../logger");
class ShowBlameCommand extends common_1.EditorCommand {
    constructor(annotationController) {
        super(common_1.Commands.ShowBlame);
        this.annotationController = annotationController;
    }
    execute(editor, edit, uri, sha) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (sha) {
                    return this.annotationController.showBlameAnnotation(editor, sha);
                }
                return this.annotationController.showBlameAnnotation(editor, editor.selection.active.line);
            }
            catch (ex) {
                logger_1.Logger.error(ex, 'ShowBlameCommand');
                return vscode_1.window.showErrorMessage(`Unable to show blame annotations. See output channel for more details`);
            }
        });
    }
}
exports.ShowBlameCommand = ShowBlameCommand;
//# sourceMappingURL=showBlame.js.map