"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("reflect-metadata");
const inversify_1 = require("inversify");
const typescript_parser_1 = require("typescript-parser");
const code_outline_1 = require("./code-outline");
const configuration_1 = require("./configuration");
const import_organizer_1 = require("./import-organizer");
const import_manager_1 = require("./import-organizer/import-manager");
const ioc_symbols_1 = require("./ioc-symbols");
const typescript_hero_1 = require("./typescript-hero");
const logger_1 = require("./utilities/logger");
const utility_functions_1 = require("./utilities/utility-functions");
const ioc = new inversify_1.Container();
ioc.bind(typescript_hero_1.default).to(typescript_hero_1.default).inSingletonScope();
ioc.bind(ioc_symbols_1.default.activatables).to(code_outline_1.default).inSingletonScope();
ioc.bind(ioc_symbols_1.default.activatables).to(import_organizer_1.default).inSingletonScope();
ioc.bind(ioc_symbols_1.default.configuration).to(configuration_1.default).inSingletonScope();
ioc
    .bind(ioc_symbols_1.default.logger)
    .toDynamicValue((context) => {
    const extContext = context.container.get(ioc_symbols_1.default.extensionContext);
    const config = context.container.get(ioc_symbols_1.default.configuration);
    return logger_1.default(config.verbosity(), extContext);
})
    .inSingletonScope();
ioc.bind(ioc_symbols_1.default.importManager).toProvider(context => (document) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    const parser = context.container.get(ioc_symbols_1.default.parser);
    const config = context.container.get(ioc_symbols_1.default.configuration);
    const logger = context.container.get(ioc_symbols_1.default.logger);
    const generatorFactory = context.container.get(ioc_symbols_1.default.generatorFactory);
    const source = yield parser.parseSource(document.getText(), utility_functions_1.getScriptKind(document.fileName));
    return new import_manager_1.default(document, source, parser, config, logger, generatorFactory);
}));
ioc.bind(ioc_symbols_1.default.parser).toConstantValue(new typescript_parser_1.TypescriptParser());
ioc
    .bind(ioc_symbols_1.default.generatorFactory)
    .toFactory((context) => {
    return (resource) => {
        const config = context.container.get(ioc_symbols_1.default.configuration);
        return new typescript_parser_1.TypescriptCodeGenerator(config.typescriptGeneratorOptions(resource));
    };
});
exports.default = ioc;
