"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const sectionKey = 'typescriptHero.codeCompletion';
class VscodeCodeCompletionConfig {
    constructor(resource) {
        this.resource = resource;
    }
    get workspaceSection() {
        return vscode_1.workspace.getConfiguration(sectionKey, this.resource);
    }
    get completionSortMode() {
        return this.workspaceSection.get('completionSortMode', 'default');
    }
}
exports.VscodeCodeCompletionConfig = VscodeCodeCompletionConfig;
