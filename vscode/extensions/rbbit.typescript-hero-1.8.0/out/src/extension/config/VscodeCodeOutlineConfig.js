"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const sectionKey = 'typescriptHero.codeOutline';
class VscodeCodeOutlineConfig {
    constructor(resource) {
        this.resource = resource;
    }
    get workspaceSection() {
        return vscode_1.workspace.getConfiguration(sectionKey, this.resource);
    }
    get outlineEnabled() {
        return this.workspaceSection.get('enabled', true);
    }
}
exports.VscodeCodeOutlineConfig = VscodeCodeOutlineConfig;
