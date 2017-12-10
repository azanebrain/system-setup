"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const vscode_1 = require("vscode");
const IoCSymbols_1 = require("../IoCSymbols");
const managers_1 = require("../managers");
const BaseExtension_1 = require("./BaseExtension");
let OrganizeImportsOnSaveExtension = OrganizeImportsOnSaveExtension_1 = class OrganizeImportsOnSaveExtension extends BaseExtension_1.BaseExtension {
    constructor(context, logger, config) {
        super(context);
        this.logger = logger;
        this.config = config;
        this.compatibleLanguages = [
            'typescript',
            'typescriptreact',
            'javascript',
            'javascriptreact',
        ];
    }
    initialize() {
        this.context.subscriptions.push(vscode_1.workspace.onWillSaveTextDocument((event) => {
            const config = this.config(event.document.uri);
            if (!config.resolver.organizeOnSave) {
                this.logger.debug('[%s] organizeOnSave is deactivated through config', OrganizeImportsOnSaveExtension_1.name);
                return;
            }
            if (this.compatibleLanguages.indexOf(event.document.languageId) < 0) {
                this.logger.debug('[%s] organizeOnSave not possible for given language', OrganizeImportsOnSaveExtension_1.name, { language: event.document.languageId });
                return;
            }
            this.logger.info('[%s] organizeOnSave for file', OrganizeImportsOnSaveExtension_1.name, { file: event.document.fileName });
            event.waitUntil(managers_1.ImportManager
                .create(event.document)
                .then(manager => manager.organizeImports().calculateTextEdits()));
        }));
        this.logger.info('[%s] initialized', OrganizeImportsOnSaveExtension_1.name);
    }
    dispose() {
        this.logger.info('[%s] disposed', OrganizeImportsOnSaveExtension_1.name);
    }
};
OrganizeImportsOnSaveExtension = OrganizeImportsOnSaveExtension_1 = tslib_1.__decorate([
    inversify_1.injectable(),
    tslib_1.__param(0, inversify_1.inject(IoCSymbols_1.iocSymbols.extensionContext)),
    tslib_1.__param(1, inversify_1.inject(IoCSymbols_1.iocSymbols.logger)),
    tslib_1.__param(2, inversify_1.inject(IoCSymbols_1.iocSymbols.configuration)),
    tslib_1.__metadata("design:paramtypes", [Object, Object, Function])
], OrganizeImportsOnSaveExtension);
exports.OrganizeImportsOnSaveExtension = OrganizeImportsOnSaveExtension;
var OrganizeImportsOnSaveExtension_1;
