"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const vscode_1 = require("vscode");
const ioc_symbols_1 = require("../ioc-symbols");
const document_outline_config_1 = require("./document-outline-config");
const imports_config_1 = require("./imports-config");
const index_config_1 = require("./index-config");
const sectionKey = 'typescriptHero';
let Configuration = class Configuration {
    constructor(context) {
        this.codeOutline = new document_outline_config_1.default();
        this.imports = new imports_config_1.default();
        this.index = new index_config_1.default();
        this._configurationChanged = new vscode_1.EventEmitter();
        context.subscriptions.push(vscode_1.workspace.onDidChangeConfiguration(() => this._configurationChanged.fire()));
        context.subscriptions.push(this._configurationChanged);
    }
    get configurationChanged() {
        return this._configurationChanged.event;
    }
    parseableLanguages() {
        return [
            'typescript',
            'typescriptreact',
            'javascript',
            'javascriptreact',
        ];
    }
    verbosity() {
        const verbosity = vscode_1.workspace.getConfiguration(sectionKey).get('verbosity', 'warn');
        if (['error', 'warn', 'info', 'debug'].indexOf(verbosity) < 0) {
            return 'warn';
        }
        return verbosity;
    }
    typescriptGeneratorOptions(resource) {
        return {
            eol: this.imports.insertSemicolons(resource) ? ';' : '',
            multiLineTrailingComma: this.imports.multiLineTrailingComma(resource),
            multiLineWrapThreshold: this.imports.multiLineWrapThreshold(resource),
            spaceBraces: this.imports.insertSpaceBeforeAndAfterImportBraces(resource),
            stringQuoteStyle: this.imports.stringQuoteStyle(resource),
            tabSize: vscode_1.window.activeTextEditor && vscode_1.window.activeTextEditor.options.tabSize ?
                vscode_1.window.activeTextEditor.options.tabSize * 1 :
                vscode_1.workspace.getConfiguration('editor', resource).get('tabSize', 4),
        };
    }
};
Configuration = tslib_1.__decorate([
    inversify_1.injectable(),
    tslib_1.__param(0, inversify_1.inject(ioc_symbols_1.default.extensionContext)),
    tslib_1.__metadata("design:paramtypes", [Object])
], Configuration);
exports.default = Configuration;
