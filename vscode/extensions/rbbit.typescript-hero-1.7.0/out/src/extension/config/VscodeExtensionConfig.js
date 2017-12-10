"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const vscode_1 = require("vscode");
const VscodeCodeCompletionConfig_1 = require("./VscodeCodeCompletionConfig");
const VscodeCodeOutlineConfig_1 = require("./VscodeCodeOutlineConfig");
const VscodeResolverConfig_1 = require("./VscodeResolverConfig");
const sectionKey = 'typescriptHero';
let VscodeExtensionConfig = class VscodeExtensionConfig {
    constructor(resource) {
        this.resource = resource;
        this.possibleLanguages = [
            'typescript',
            'typescriptreact',
            'javascript',
            'javascriptreact',
        ];
        this.codeCompletionConfig = new VscodeCodeCompletionConfig_1.VscodeCodeCompletionConfig(resource);
        this.codeOutlineConfig = new VscodeCodeOutlineConfig_1.VscodeCodeOutlineConfig(resource);
        this.resolverConfig = new VscodeResolverConfig_1.VscodeResolverConfig(resource);
    }
    get workspaceSection() {
        return vscode_1.workspace.getConfiguration(sectionKey, this.resource);
    }
    get verbosity() {
        const verbosity = this.workspaceSection.get('verbosity', 'warn');
        if (['error', 'warn', 'info', 'debug'].indexOf(verbosity) < 0) {
            return 'warn';
        }
        return verbosity;
    }
    get resolver() {
        return this.resolverConfig;
    }
    get codeOutline() {
        return this.codeOutlineConfig;
    }
    get codeCompletion() {
        return this.codeCompletionConfig;
    }
};
VscodeExtensionConfig = tslib_1.__decorate([
    inversify_1.injectable(),
    tslib_1.__metadata("design:paramtypes", [vscode_1.Uri])
], VscodeExtensionConfig);
exports.VscodeExtensionConfig = VscodeExtensionConfig;
