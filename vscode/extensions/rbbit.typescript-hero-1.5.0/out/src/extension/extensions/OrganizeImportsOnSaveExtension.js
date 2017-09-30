"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const vscode_1 = require("vscode");
const IoCSymbols_1 = require("../IoCSymbols");
const managers_1 = require("../managers");
const BaseExtension_1 = require("./BaseExtension");
let OrganizeImportsOnSaveExtension = class OrganizeImportsOnSaveExtension extends BaseExtension_1.BaseExtension {
    constructor(context, loggerFactory, config) {
        super(context);
        this.config = config;
        this.compatibleLanguages = [
            'typescript',
            'typescriptreact',
            'javascript',
            'javascriptreact',
        ];
        this.logger = loggerFactory('OrganizeImportsOnSaveExtension');
    }
    initialize() {
        this.context.subscriptions.push(vscode_1.workspace.onWillSaveTextDocument((event) => {
            if (!this.config.resolver.organizeOnSave) {
                this.logger.info('Organize on save is deactivated through config.');
                return;
            }
            if (this.compatibleLanguages.indexOf(event.document.languageId) < 0) {
                this.logger.info(`Organize imports for languageId "${event.document.languageId}" not possible.`);
                return;
            }
            this.logger.info(`Organize on save for document "${event.document.fileName}".`);
            event.waitUntil(managers_1.ImportManager
                .create(event.document)
                .then(manager => manager.organizeImports().calculateTextEdits()));
        }));
        this.logger.info('Initialized');
    }
    dispose() {
        this.logger.info('Disposed');
    }
};
OrganizeImportsOnSaveExtension = tslib_1.__decorate([
    inversify_1.injectable(),
    tslib_1.__param(0, inversify_1.inject(IoCSymbols_1.iocSymbols.extensionContext)),
    tslib_1.__param(1, inversify_1.inject(IoCSymbols_1.iocSymbols.loggerFactory)),
    tslib_1.__param(2, inversify_1.inject(IoCSymbols_1.iocSymbols.configuration)),
    tslib_1.__metadata("design:paramtypes", [Object, Function, Object])
], OrganizeImportsOnSaveExtension);
exports.OrganizeImportsOnSaveExtension = OrganizeImportsOnSaveExtension;
