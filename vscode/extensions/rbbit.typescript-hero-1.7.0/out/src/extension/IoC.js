"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const inversify_1 = require("inversify");
const inversify_inject_decorators_1 = require("inversify-inject-decorators");
const typescript_parser_1 = require("typescript-parser");
const code_actions_1 = require("./code-actions");
const VscodeExtensionConfig_1 = require("./config/VscodeExtensionConfig");
const CodeActionExtension_1 = require("./extensions/CodeActionExtension");
const CodeCompletionExtension_1 = require("./extensions/CodeCompletionExtension");
const DocumentSymbolStructureExtension_1 = require("./extensions/DocumentSymbolStructureExtension");
const ImportResolveExtension_1 = require("./extensions/ImportResolveExtension");
const OrganizeImportsOnSaveExtension_1 = require("./extensions/OrganizeImportsOnSaveExtension");
const IoCSymbols_1 = require("./IoCSymbols");
const TypeScriptHero_1 = require("./TypeScriptHero");
const DeclarationIndexMapper_1 = require("./utilities/DeclarationIndexMapper");
const winstonLogger_1 = require("./utilities/winstonLogger");
const container = new inversify_1.Container();
container.bind(TypeScriptHero_1.TypeScriptHero).to(TypeScriptHero_1.TypeScriptHero).inSingletonScope();
container.bind(IoCSymbols_1.iocSymbols.declarationIndexMapper).to(DeclarationIndexMapper_1.DeclarationIndexMapper).inSingletonScope();
container
    .bind(IoCSymbols_1.iocSymbols.typescriptParser)
    .toConstantValue(new typescript_parser_1.TypescriptParser());
container
    .bind(IoCSymbols_1.iocSymbols.generatorFactory)
    .toFactory((context) => {
    return (resource) => {
        const configFactory = context.container.get(IoCSymbols_1.iocSymbols.configuration);
        return new typescript_parser_1.TypescriptCodeGenerator(configFactory(resource).resolver.generationOptions);
    };
});
container
    .bind(IoCSymbols_1.iocSymbols.configuration)
    .toFactory(() => (resource) => new VscodeExtensionConfig_1.VscodeExtensionConfig(resource));
container.bind(IoCSymbols_1.iocSymbols.extensions).to(ImportResolveExtension_1.ImportResolveExtension).inSingletonScope();
container.bind(IoCSymbols_1.iocSymbols.extensions).to(CodeCompletionExtension_1.CodeCompletionExtension).inSingletonScope();
container.bind(IoCSymbols_1.iocSymbols.extensions).to(DocumentSymbolStructureExtension_1.DocumentSymbolStructureExtension).inSingletonScope();
container.bind(IoCSymbols_1.iocSymbols.extensions).to(CodeActionExtension_1.CodeActionExtension).inSingletonScope();
container.bind(IoCSymbols_1.iocSymbols.extensions).to(OrganizeImportsOnSaveExtension_1.OrganizeImportsOnSaveExtension).inSingletonScope();
container
    .bind(IoCSymbols_1.iocSymbols.logger)
    .toDynamicValue((context) => {
    const extContext = context.container.get(IoCSymbols_1.iocSymbols.extensionContext);
    const config = context.container.get(IoCSymbols_1.iocSymbols.configuration)();
    return winstonLogger_1.default(config.verbosity, extContext);
})
    .inSingletonScope();
container.bind(IoCSymbols_1.iocSymbols.codeActionCreators).to(code_actions_1.MissingImportCreator);
container.bind(IoCSymbols_1.iocSymbols.codeActionCreators).to(code_actions_1.MissingImplementationInClassCreator);
exports.Container = container;
exports.IocDecorators = inversify_inject_decorators_1.default(container);
