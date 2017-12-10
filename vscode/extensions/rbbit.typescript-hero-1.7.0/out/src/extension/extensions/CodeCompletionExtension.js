"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const typescript_parser_1 = require("typescript-parser");
const vscode_1 = require("vscode");
const helpers_1 = require("../../common/helpers");
const IoCSymbols_1 = require("../IoCSymbols");
const ImportManager_1 = require("../managers/ImportManager");
const DeclarationIndexMapper_1 = require("../utilities/DeclarationIndexMapper");
const utilityFunctions_1 = require("../utilities/utilityFunctions");
const BaseExtension_1 = require("./BaseExtension");
let CodeCompletionExtension = CodeCompletionExtension_1 = class CodeCompletionExtension extends BaseExtension_1.BaseExtension {
    constructor(context, logger, parser, indices, config) {
        super(context);
        this.logger = logger;
        this.parser = parser;
        this.indices = indices;
        this.config = config;
    }
    initialize() {
        for (const lang of this.config().possibleLanguages) {
            this.context.subscriptions.push(vscode_1.languages.registerCompletionItemProvider(lang, this));
        }
        this.context.subscriptions.push(vscode_1.commands.registerCommand('typescriptHero.codeCompletion.executeIntellisenseItem', (document, declaration) => this.executeIntellisenseItem(document, declaration)));
        this.logger.info('[%s] initialized', CodeCompletionExtension_1.name);
    }
    dispose() {
        this.logger.info('[%s] disposed', CodeCompletionExtension_1.name);
    }
    provideCompletionItems(document, position, token) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const index = this.indices.getIndexForFile(document.uri);
            const config = this.config(document.uri);
            const rootFolder = vscode_1.workspace.getWorkspaceFolder(document.uri);
            if (!index ||
                !index.indexReady ||
                !config.resolver.resolverModeLanguages.some(lng => lng === document.languageId) ||
                !rootFolder) {
                this.logger.debug('[%s] resolver not ready or no workspace folder selected', CodeCompletionExtension_1.name);
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
                !index.indexReady ||
                (lineText.substring(0, position.character).match(/["'`]/g) || []).length % 2 === 1 ||
                lineText.match(/^\s*(\/\/|\/\*\*|\*\/|\*)/g) ||
                lineText.startsWith('import ') ||
                lineText.substring(0, position.character).match(new RegExp(`(\w*[.])+${searchWord}`, 'g'))) {
                this.logger.debug('[%s] did not match criteria to provide intellisense', CodeCompletionExtension_1.name, { searchWord, lineText, indexReady: index.indexReady });
                return Promise.resolve(null);
            }
            this.logger.debug('[%s] provide code completion for "%s"', CodeCompletionExtension_1.name, searchWord);
            const profiler = this.logger.startTimer();
            const parsed = yield this.parser.parseSource(document.getText());
            const declarations = helpers_1.getDeclarationsFilteredByImports(index.declarationInfos, document.fileName, parsed.imports, rootFolder.uri.fsPath)
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
                if (config.codeCompletion.completionSortMode === 'bottom') {
                    item.sortText = `9999-${declaration.declaration.name}`;
                }
                items.push(item);
            }
            profiler.done({ message: `[${CodeCompletionExtension_1.name}] calculated code completions` });
            return items;
        });
    }
    executeIntellisenseItem(document, declaration) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.logger.debug('[%s] execute code completion action', CodeCompletionExtension_1.name, { specifier: declaration.declaration.name, library: declaration.from });
            const manager = yield ImportManager_1.ImportManager.create(document);
            manager.addDeclarationImport(declaration);
            yield manager.commit();
        });
    }
};
CodeCompletionExtension = CodeCompletionExtension_1 = tslib_1.__decorate([
    inversify_1.injectable(),
    tslib_1.__param(0, inversify_1.inject(IoCSymbols_1.iocSymbols.extensionContext)),
    tslib_1.__param(1, inversify_1.inject(IoCSymbols_1.iocSymbols.logger)),
    tslib_1.__param(2, inversify_1.inject(IoCSymbols_1.iocSymbols.typescriptParser)),
    tslib_1.__param(3, inversify_1.inject(IoCSymbols_1.iocSymbols.declarationIndexMapper)),
    tslib_1.__param(4, inversify_1.inject(IoCSymbols_1.iocSymbols.configuration)),
    tslib_1.__metadata("design:paramtypes", [Object, Object, typescript_parser_1.TypescriptParser,
        DeclarationIndexMapper_1.DeclarationIndexMapper, Function])
], CodeCompletionExtension);
exports.CodeCompletionExtension = CodeCompletionExtension;
var CodeCompletionExtension_1;
