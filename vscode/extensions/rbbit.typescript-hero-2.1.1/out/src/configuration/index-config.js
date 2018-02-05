"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const sectionKey = 'typescriptHero.index';
class IndexConfig {
    workspaceIgnorePatterns(resource) {
        return vscode_1.workspace.getConfiguration(sectionKey, resource).get('workspaceIgnorePatterns', [
            '**/build/**/*',
            '**/out/**/*',
            '**/dist/**/*',
        ]);
    }
    moduleIgnorePatterns(resource) {
        return vscode_1.workspace.getConfiguration(sectionKey, resource).get('moduleIgnorePatterns', [
            '**/node_modules/**/*',
        ]);
    }
}
exports.default = IndexConfig;
