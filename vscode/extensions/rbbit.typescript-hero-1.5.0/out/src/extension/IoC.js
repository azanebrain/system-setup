"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const inversify_1 = require("inversify");
const inversify_inject_decorators_1 = require("inversify-inject-decorators");
const typescript_parser_1 = require("typescript-parser");
const vscode_1 = require("vscode");
const code_actions_1 = require("./code-actions");
const CodeActionExtension_1 = require("./extensions/CodeActionExtension");
const CodeCompletionExtension_1 = require("./extensions/CodeCompletionExtension");
const DocumentSymbolStructureExtension_1 = require("./extensions/DocumentSymbolStructureExtension");
const ImportResolveExtension_1 = require("./extensions/ImportResolveExtension");
const OrganizeImportsOnSaveExtension_1 = require("./extensions/OrganizeImportsOnSaveExtension");
const IoCSymbols_1 = require("./IoCSymbols");
const TypeScriptHero_1 = require("./TypeScriptHero");
const VscodeLogger_1 = require("./utilities/VscodeLogger");
const VscodeExtensionConfig_1 = require("./VscodeExtensionConfig");
const container = new inversify_1.Container();
container.bind(IoCSymbols_1.iocSymbols.rootPath).toConstantValue(vscode_1.workspace.rootPath || '');
container.bind(TypeScriptHero_1.TypeScriptHero).to(TypeScriptHero_1.TypeScriptHero).inSingletonScope();
container.bind(IoCSymbols_1.iocSymbols.configuration).to(VscodeExtensionConfig_1.VscodeExtensionConfig).inSingletonScope();
container
    .bind(IoCSymbols_1.iocSymbols.declarationIndex)
    .toDynamicValue((context) => {
    const parser = context.container.get(IoCSymbols_1.iocSymbols.typescriptParser);
    return new typescript_parser_1.DeclarationIndex(parser, context.container.get(IoCSymbols_1.iocSymbols.rootPath));
})
    .inSingletonScope();
container
    .bind(IoCSymbols_1.iocSymbols.typescriptParser)
    .toDynamicValue(() => {
    return new typescript_parser_1.TypescriptParser();
})
    .inSingletonScope();
container
    .bind(IoCSymbols_1.iocSymbols.generatorFactory)
    .toFactory((context) => {
    return () => {
        const config = context.container.get(IoCSymbols_1.iocSymbols.configuration);
        return new typescript_parser_1.TypescriptCodeGenerator(config.resolver.generationOptions);
    };
});
container.bind(IoCSymbols_1.iocSymbols.extensions).to(ImportResolveExtension_1.ImportResolveExtension).inSingletonScope();
container.bind(IoCSymbols_1.iocSymbols.extensions).to(CodeCompletionExtension_1.CodeCompletionExtension).inSingletonScope();
container.bind(IoCSymbols_1.iocSymbols.extensions).to(DocumentSymbolStructureExtension_1.DocumentSymbolStructureExtension).inSingletonScope();
container.bind(IoCSymbols_1.iocSymbols.extensions).to(CodeActionExtension_1.CodeActionExtension).inSingletonScope();
container.bind(IoCSymbols_1.iocSymbols.extensions).to(OrganizeImportsOnSaveExtension_1.OrganizeImportsOnSaveExtension).inSingletonScope();
container
    .bind(IoCSymbols_1.iocSymbols.loggerFactory)
    .toFactory((context) => {
    return (prefix) => {
        const extContext = context.container.get(IoCSymbols_1.iocSymbols.extensionContext);
        const config = context.container.get(IoCSymbols_1.iocSymbols.configuration);
        return new VscodeLogger_1.VscodeLogger(extContext, config, prefix);
    };
});
container.bind(IoCSymbols_1.iocSymbols.codeActionCreators).to(code_actions_1.MissingImportCreator);
container.bind(IoCSymbols_1.iocSymbols.codeActionCreators).to(code_actions_1.MissingImplementationInClassCreator);
exports.Container = container;
exports.IocDecorators = inversify_inject_decorators_1.default(container);
