"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const enums_1 = require("../../common/enums");
const import_grouping_1 = require("../import-grouping");
const sectionKey = 'typescriptHero.resolver';
class VscodeResolverConfig {
    constructor(resource) {
        this.resource = resource;
    }
    get workspaceSection() {
        return vscode_1.workspace.getConfiguration(sectionKey, this.resource);
    }
    get insertSpaceBeforeAndAfterImportBraces() {
        return this.workspaceSection.get('insertSpaceBeforeAndAfterImportBraces', true);
    }
    get insertSemicolons() {
        return this.workspaceSection.get('insertSemicolons', true);
    }
    get stringQuoteStyle() {
        return this.workspaceSection.get('stringQuoteStyle', `'`);
    }
    get ignorePatterns() {
        return this.workspaceSection.get('ignorePatterns', [
            'build',
            'out',
            'dist',
        ]);
    }
    get multiLineWrapThreshold() {
        return this.workspaceSection.get('multiLineWrapThreshold', 125);
    }
    get multiLineTrailingComma() {
        return this.workspaceSection.get('multiLineTrailingComma', true);
    }
    get disableImportSorting() {
        return this.workspaceSection.get('disableImportsSorting', false);
    }
    get disableImportRemovalOnOrganize() {
        return this.workspaceSection.get('disableImportRemovalOnOrganize', false);
    }
    get tabSize() {
        return vscode_1.workspace.getConfiguration().get('editor.tabSize', 4);
    }
    get ignoreImportsForOrganize() {
        return this.workspaceSection.get('ignoreImportsForOrganize', []);
    }
    get importGroups() {
        const groups = this.workspaceSection.get('importGroups');
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
        const mode = this.workspaceSection.get('resolverMode', 'TypeScript');
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
        const typescriptHeroValue = this.workspaceSection.get('organizeOnSave', false);
        const editorValue = vscode_1.workspace.getConfiguration('editor', this.resource).get('formatOnSave', false);
        return typescriptHeroValue && editorValue;
    }
    get promptForSpecifiers() {
        return this.workspaceSection.get('promptForSpecifiers', false);
    }
}
exports.VscodeResolverConfig = VscodeResolverConfig;
