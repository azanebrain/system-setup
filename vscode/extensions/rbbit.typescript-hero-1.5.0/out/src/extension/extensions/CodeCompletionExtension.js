"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const typescript_parser_1 = require("typescript-parser");
const vscode_1 = require("vscode");
const helpers_1 = require("../../common/helpers");
const IoCSymbols_1 = require("../IoCSymbols");
const ImportManager_1 = require("../managers/ImportManager");
const utilityFunctions_1 = require("../utilities/utilityFunctions");
const BaseExtension_1 = require("./BaseExtension");
let CodeCompletionExtension = class CodeCompletionExtension extends BaseExtension_1.BaseExtension {
    constructor(context, loggerFactory, parser, index, rootPath, config) {
        super(context);
        this.parser = parser;
        this.index = index;
        this.rootPath = rootPath;
        this.config = config;
        this.languageRegisters = [];
        this.logger = loggerFactory('CodeCompletionExtension');
    }
    initialize() {
        for (const lang of this.config.resolver.resolverModeLanguages) {
            this.languageRegisters.push(vscode_1.languages.registerCompletionItemProvider(lang, this));
        }
        this.context.subscriptions.push(vscode_1.workspace.onDidChangeConfiguration(() => {
            if (this.languageRegisters.length !== this.config.resolver.resolverModeLanguages.length) {
                this.logger.info('ResolverMode has changed, registering to new configuration languages');
                for (const register of this.languageRegisters) {
                    register.dispose();
                }
                this.languageRegisters = [];
                for (const lang of this.config.resolver.resolverModeLanguages) {
                    this.languageRegisters.push(vscode_1.languages.registerCompletionItemProvider(lang, this));
                }
            }
        }));
        this.context.subscriptions.push(vscode_1.commands.registerCommand('typescriptHero.codeCompletion.executeIntellisenseItem', (document, declaration) => this.executeIntellisenseItem(document, declaration)));
        this.logger.info('Initialized');
    }
    dispose() {
        for (const register of this.languageRegisters) {
            register.dispose();
        }
        this.logger.info('Disposed');
    }
    provideCompletionItems(document, position, token) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this.index.indexReady) {
                return null;
            }
            const wordAtPosition = document.getWordRangeAtPosition(position);
            const lineText = document.lineAt(position.line).text;
            let searchWord = '';
            if (wordAtPosition && wordAtPosition.start.character < position.character) {
                const word = document.getText(wordAtPosition);
                searchWord = word.substr(0, position.character - wordAtPosition.start.character);
            }
            if (!searchWord ||
                token.isCancellationRequested ||
                !this.index.indexReady ||
                (lineText.substring(0, position.character).match(/["'`]/g) || []).length % 2 === 1 ||
                lineText.match(/^\s*(\/\/|\/\*\*|\*\/|\*)/g) ||
                lineText.startsWith('import ') ||
                lineText.substring(0, position.character).match(new RegExp(`(\w*[.])+${searchWord}`, 'g'))) {
                return Promise.resolve(null);
            }
            this.logger.info('Search completion for word.', { searchWord });
            const parsed = yield this.parser.parseSource(document.getText());
            const declarations = helpers_1.getDeclarationsFilteredByImports(this.index.declarationInfos, document.fileName, parsed.imports, this.rootPath)
                .filter(o => !parsed.declarations.some(d => d.name === o.declaration.name))
                .filter(o => !parsed.usages.some(d => d === o.declaration.name));
            const items = [];
            for (const declaration of declarations.filter(o => o.declaration.name.toLowerCase().indexOf(searchWord.toLowerCase()) >= 0)) {
                const item = new vscode_1.CompletionItem(declaration.declaration.name, utilityFunctions_1.getItemKind(declaration.declaration));
                item.detail = declaration.from;
                item.command = {
                    arguments: [document, declaration],
                    title: 'Execute intellisense insert',
                    command: 'typescriptHero.codeCompletion.executeIntellisenseItem',
                };
                if (this.config.completionSortMode === 'bottom') {
                    item.sortText = `9999-${declaration.declaration.name}`;
                }
                items.push(item);
            }
            return items;
        });
    }
    executeIntellisenseItem(document, declaration) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const manager = yield ImportManager_1.ImportManager.create(document);
            manager.addDeclarationImport(declaration);
            yield manager.commit();
        });
    }
};
CodeCompletionExtension = tslib_1.__decorate([
    inversify_1.injectable(),
    tslib_1.__param(0, inversify_1.inject(IoCSymbols_1.iocSymbols.extensionContext)),
    tslib_1.__param(1, inversify_1.inject(IoCSymbols_1.iocSymbols.loggerFactory)),
    tslib_1.__param(2, inversify_1.inject(IoCSymbols_1.iocSymbols.typescriptParser)),
    tslib_1.__param(3, inversify_1.inject(IoCSymbols_1.iocSymbols.declarationIndex)),
    tslib_1.__param(4, inversify_1.inject(IoCSymbols_1.iocSymbols.rootPath)),
    tslib_1.__param(5, inversify_1.inject(IoCSymbols_1.iocSymbols.configuration)),
    tslib_1.__metadata("design:paramtypes", [Object, Function, typescript_parser_1.TypescriptParser,
        typescript_parser_1.DeclarationIndex, String, Object])
], CodeCompletionExtension);
exports.CodeCompletionExtension = CodeCompletionExtension;
