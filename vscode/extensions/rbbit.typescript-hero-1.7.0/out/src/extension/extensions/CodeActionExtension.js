"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const vscode_1 = require("vscode");
const CodeActionCreator_1 = require("../code-actions/CodeActionCreator");
const IoCSymbols_1 = require("../IoCSymbols");
const DeclarationIndexMapper_1 = require("../utilities/DeclarationIndexMapper");
const BaseExtension_1 = require("./BaseExtension");
let CodeActionExtension = class CodeActionExtension extends BaseExtension_1.BaseExtension {
    constructor(context, logger, actionCreators, indices) {
        super(context);
        this.logger = logger;
        this.actionCreators = actionCreators;
        this.indices = indices;
    }
    initialize() {
        this.context.subscriptions.push(vscode_1.commands.registerCommand('typescriptHero.codeFix.executeCodeAction', (codeAction) => this.executeCodeAction(codeAction)));
        this.context.subscriptions.push(vscode_1.languages.registerCodeActionsProvider('typescript', this));
        this.context.subscriptions.push(vscode_1.languages.registerCodeActionsProvider('typescriptreact', this));
        this.logger.info('[%s] initialized', CodeActionCreator_1.CodeActionCreator.name);
    }
    dispose() {
        this.logger.info('[%s] disposed', CodeActionCreator_1.CodeActionCreator.name);
    }
    provideCodeActions(document, _range, context, _token) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const index = this.indices.getIndexForFile(document.uri);
            if (!index || !index.indexReady) {
                return [];
            }
            this.logger.debug('[%s] provide code actions for file', CodeActionCreator_1.CodeActionCreator.name, { file: document.fileName });
            const profiler = this.logger.startTimer();
            let commands = [];
            for (const diagnostic of context.diagnostics) {
                for (const creator of this.actionCreators) {
                    if (creator.canHandleDiagnostic(diagnostic)) {
                        commands = yield creator.handleDiagnostic(document, commands, diagnostic);
                    }
                }
            }
            profiler.done({ message: `[${CodeActionCreator_1.CodeActionCreator.name}] calculated diagnostics` });
            return commands;
        });
    }
    executeCodeAction(codeAction) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!codeAction) {
                this.logger.warn('[%s] executeCodeAction used without param', CodeActionCreator_1.CodeActionCreator.name);
                vscode_1.window.showWarningMessage('This command is for internal use only. It cannot be used from Cmd+P');
                return;
            }
            if (!(yield codeAction.execute())) {
                this.logger.warn('[%s] code action could not complete', CodeActionCreator_1.CodeActionCreator.name, { codeAction });
                vscode_1.window.showWarningMessage('The provided code action could not complete. Please see the logs.');
            }
        });
    }
};
CodeActionExtension = tslib_1.__decorate([
    inversify_1.injectable(),
    tslib_1.__param(0, inversify_1.inject(IoCSymbols_1.iocSymbols.extensionContext)),
    tslib_1.__param(1, inversify_1.inject(IoCSymbols_1.iocSymbols.logger)),
    tslib_1.__param(2, inversify_1.multiInject(IoCSymbols_1.iocSymbols.codeActionCreators)),
    tslib_1.__param(3, inversify_1.inject(IoCSymbols_1.iocSymbols.declarationIndexMapper)),
    tslib_1.__metadata("design:paramtypes", [Object, Object, Array, DeclarationIndexMapper_1.DeclarationIndexMapper])
], CodeActionExtension);
exports.CodeActionExtension = CodeActionExtension;
