"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const vscode_1 = require("vscode");
const configuration_1 = require("../configuration");
const ioc_symbols_1 = require("../ioc-symbols");
let ImportOrganizer = class ImportOrganizer {
    constructor(context, logger, config, importManagerProvider) {
        this.context = context;
        this.logger = logger;
        this.config = config;
        this.importManagerProvider = importManagerProvider;
    }
    setup() {
        this.logger.debug('Setting up ImportOrganizer.');
        this.context.subscriptions.push(vscode_1.commands.registerTextEditorCommand('typescriptHero.imports.organize', () => this.organizeImports()));
        this.context.subscriptions.push(vscode_1.workspace.onWillSaveTextDocument((event) => {
            if (!this.config.imports.organizeOnSave(event.document.uri)) {
                this.logger.debug('[ImportOrganizer] organizeOnSave is deactivated through config');
                return;
            }
            if (this.config.parseableLanguages().indexOf(event.document.languageId) < 0) {
                this.logger.debug('[ImportOrganizer] organizeOnSave not possible for given language', { language: event.document.languageId });
                return;
            }
            this.logger.info('[ImportOrganizer] organizeOnSave for file', { file: event.document.fileName });
            event.waitUntil(this.importManagerProvider(event.document).then(manager => manager.organizeImports().calculateTextEdits()));
        }));
    }
    start() {
        this.logger.info('Starting up ImportOrganizer.');
    }
    stop() {
        this.logger.info('Stopping ImportOrganizer.');
    }
    dispose() {
        this.logger.debug('Disposing ImportOrganizer.');
    }
    organizeImports() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!vscode_1.window.activeTextEditor) {
                return;
            }
            try {
                this.logger.debug('[ImportOrganizer] organize the imports in the document', { file: vscode_1.window.activeTextEditor.document.fileName });
                const ctrl = yield this.importManagerProvider(vscode_1.window.activeTextEditor.document);
                yield ctrl.organizeImports().commit();
            }
            catch (e) {
                this.logger.error('[ImportOrganizer] imports could not be organized, error: %s', e, { file: vscode_1.window.activeTextEditor.document.fileName });
            }
        });
    }
};
ImportOrganizer = tslib_1.__decorate([
    inversify_1.injectable(),
    tslib_1.__param(0, inversify_1.inject(ioc_symbols_1.default.extensionContext)),
    tslib_1.__param(1, inversify_1.inject(ioc_symbols_1.default.logger)),
    tslib_1.__param(2, inversify_1.inject(ioc_symbols_1.default.configuration)),
    tslib_1.__param(3, inversify_1.inject(ioc_symbols_1.default.importManager)),
    tslib_1.__metadata("design:paramtypes", [Object, Object, configuration_1.default, Function])
], ImportOrganizer);
exports.default = ImportOrganizer;
