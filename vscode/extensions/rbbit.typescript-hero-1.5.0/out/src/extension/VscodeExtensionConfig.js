"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const vscode_1 = require("vscode");
const enums_1 = require("../common/enums");
const import_grouping_1 = require("./import-grouping");
const sectionKey = 'typescriptHero';
let VscodeExtensionConfig = class VscodeExtensionConfig {
    constructor() {
        this.resolverConfig = new VscodeResolverConfig();
        this.codeOutlineConfig = new VscodeCodeOutlineConfig();
    }
    get workspaceSection() {
        return vscode_1.workspace.getConfiguration(sectionKey);
    }
    get verbosity() {
        return this.workspaceSection.get('verbosity') || 'Warning';
    }
    get resolver() {
        return this.resolverConfig;
    }
    get codeOutline() {
        return this.codeOutlineConfig;
    }
    get completionSortMode() {
        return this.workspaceSection.get('completionSortMode') || 'default';
    }
};
VscodeExtensionConfig = tslib_1.__decorate([
    inversify_1.injectable()
], VscodeExtensionConfig);
exports.VscodeExtensionConfig = VscodeExtensionConfig;
class VscodeResolverConfig {
    get workspaceSection() {
        return vscode_1.workspace.getConfiguration(sectionKey);
    }
    get insertSpaceBeforeAndAfterImportBraces() {
        const value = this.workspaceSection.get('resolver.insertSpaceBeforeAndAfterImportBraces');
        return value !== undefined ? value : true;
    }
    get insertSemicolons() {
        const value = this.workspaceSection.get('resolver.insertSemicolons');
        return value !== undefined ? value : true;
    }
    get stringQuoteStyle() {
        return this.workspaceSection.get('resolver.stringQuoteStyle') || `'`;
    }
    get ignorePatterns() {
        return this.workspaceSection.get('resolver.ignorePatterns') || [
            'build',
            'out',
            'dist',
        ];
    }
    get multiLineWrapThreshold() {
        return this.workspaceSection.get('resolver.multiLineWrapThreshold') || 125;
    }
    get multiLineTrailingComma() {
        const value = this.workspaceSection.get('resolver.multiLineTrailingComma');
        return value !== undefined ? value : true;
    }
    get disableImportSorting() {
        const value = this.workspaceSection.get('resolver.disableImportsSorting');
        return value !== undefined ? value : false;
    }
    get tabSize() {
        return vscode_1.workspace.getConfiguration().get('editor.tabSize') || 4;
    }
    get ignoreImportsForOrganize() {
        return this.workspaceSection.get('resolver.ignoreImportsForOrganize') || [];
    }
    get importGroups() {
        const groups = this.workspaceSection.get('resolver.importGroups');
        let importGroups = [];
        try {
            if (groups) {
                importGroups = groups.map(g => import_grouping_1.ImportGroupSettingParser.parseSetting(g));
            }
            else {
                importGroups = import_grouping_1.ImportGroupSettingParser.default;
            }
        }
        catch (e) {
            importGroups = import_grouping_1.ImportGroupSettingParser.default;
        }
        if (!importGroups.some(i => i instanceof import_grouping_1.RemainImportGroup)) {
            importGroups.push(new import_grouping_1.RemainImportGroup());
        }
        return importGroups;
    }
    get generationOptions() {
        return {
            eol: this.insertSemicolons ? ';' : '',
            multiLineWrapThreshold: this.multiLineWrapThreshold,
            multiLineTrailingComma: this.multiLineTrailingComma,
            spaceBraces: this.insertSpaceBeforeAndAfterImportBraces,
            stringQuoteStyle: this.stringQuoteStyle,
            tabSize: this.tabSize,
        };
    }
    get resolverMode() {
        const mode = this.workspaceSection.get('resolver.resolverMode', 'TypeScript');
        return enums_1.ResolverMode[mode] || enums_1.ResolverMode.TypeScript;
    }
    get resolverModeFileGlobs() {
        const mode = this.resolverMode;
        const globs = [];
        if (mode === enums_1.ResolverMode.TypeScript || mode === enums_1.ResolverMode.Both) {
            globs.push('**/*.ts');
            globs.push('**/*.tsx');
        }
        if (mode === enums_1.ResolverMode.ES6 || mode === enums_1.ResolverMode.Both) {
            globs.push('**/*.js');
            globs.push('**/*.jsx');
        }
        return globs;
    }
    get resolverModeLanguages() {
        const mode = this.resolverMode;
        const languages = [];
        if (mode === enums_1.ResolverMode.TypeScript || mode === enums_1.ResolverMode.Both) {
            languages.push('typescript');
            languages.push('typescriptreact');
        }
        if (mode === enums_1.ResolverMode.ES6 || mode === enums_1.ResolverMode.Both) {
            languages.push('javascript');
            languages.push('javascriptreact');
        }
        return languages;
    }
    get organizeOnSave() {
        const typescriptHeroValue = this.workspaceSection.get('resolver.organizeOnSave', true);
        const editorValue = vscode_1.workspace.getConfiguration().get('editor.formatOnSave', false);
        return typescriptHeroValue && editorValue;
    }
    get promptForSpecifiers() {
        return this.workspaceSection.get('resolver.promptForSpecifiers', false);
    }
}
class VscodeCodeOutlineConfig {
    get workspaceSection() {
        return vscode_1.workspace.getConfiguration(sectionKey);
    }
    get outlineEnabled() {
        const value = this.workspaceSection.get('codeOutline.enabled');
        return value !== undefined ? value : true;
    }
}
