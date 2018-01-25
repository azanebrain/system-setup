"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const sectionKey = 'typescriptHero.codeOutline';
class DocumentOutlineConfig {
    isEnabled() {
        return vscode_1.workspace.getConfiguration(sectionKey).get('enabled', true);
    }
}
exports.default = DocumentOutlineConfig;
