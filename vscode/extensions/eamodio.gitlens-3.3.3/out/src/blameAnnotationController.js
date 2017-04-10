'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const system_1 = require("./system");
const vscode_1 = require("vscode");
const blameAnnotationProvider_1 = require("./blameAnnotationProvider");
const comparers_1 = require("./comparers");
const gitService_1 = require("./gitService");
const logger_1 = require("./logger");
const whitespaceController_1 = require("./whitespaceController");
exports.BlameDecorations = {
    annotation: vscode_1.window.createTextEditorDecorationType({
        before: {
            margin: '0 1.75em 0 0'
        },
        after: {
            margin: '0 0 0 4em'
        }
    }),
    highlight: undefined
};
class BlameAnnotationController extends vscode_1.Disposable {
    constructor(context, git, gitContextTracker) {
        super(() => this.dispose());
        this.context = context;
        this.git = git;
        this.gitContextTracker = gitContextTracker;
        this._onDidToggleBlameAnnotationsEmitter = new vscode_1.EventEmitter();
        this._annotationProviders = new Map();
        this._onConfigurationChanged();
        const subscriptions = [];
        subscriptions.push(vscode_1.workspace.onDidChangeConfiguration(this._onConfigurationChanged, this));
        this._disposable = vscode_1.Disposable.from(...subscriptions);
    }
    get onDidToggleBlameAnnotations() {
        return this._onDidToggleBlameAnnotationsEmitter.event;
    }
    dispose() {
        this._annotationProviders.forEach((p, i) => __awaiter(this, void 0, void 0, function* () { return yield this.clear(i); }));
        exports.BlameDecorations.annotation && exports.BlameDecorations.annotation.dispose();
        exports.BlameDecorations.highlight && exports.BlameDecorations.highlight.dispose();
        this._blameAnnotationsDisposable && this._blameAnnotationsDisposable.dispose();
        this._whitespaceController && this._whitespaceController.dispose();
        this._disposable && this._disposable.dispose();
    }
    _onConfigurationChanged() {
        let toggleWhitespace = vscode_1.workspace.getConfiguration('gitlens.advanced.toggleWhitespace').get('enabled');
        if (!toggleWhitespace) {
            toggleWhitespace = vscode_1.workspace.getConfiguration('editor').get('fontLigatures');
        }
        if (toggleWhitespace && !this._whitespaceController) {
            this._whitespaceController = new whitespaceController_1.WhitespaceController();
        }
        else if (!toggleWhitespace && this._whitespaceController) {
            this._whitespaceController.dispose();
            this._whitespaceController = undefined;
        }
        const config = vscode_1.workspace.getConfiguration('gitlens').get('blame');
        if (config.annotation.highlight !== (this._config && this._config.annotation.highlight)) {
            exports.BlameDecorations.highlight && exports.BlameDecorations.highlight.dispose();
            switch (config.annotation.highlight) {
                case 'gutter':
                    exports.BlameDecorations.highlight = vscode_1.window.createTextEditorDecorationType({
                        dark: {
                            gutterIconPath: this.context.asAbsolutePath('images/blame-dark.svg'),
                            overviewRulerColor: 'rgba(255, 255, 255, 0.75)'
                        },
                        light: {
                            gutterIconPath: this.context.asAbsolutePath('images/blame-light.svg'),
                            overviewRulerColor: 'rgba(0, 0, 0, 0.75)'
                        },
                        gutterIconSize: 'contain',
                        overviewRulerLane: vscode_1.OverviewRulerLane.Right
                    });
                    break;
                case 'line':
                    exports.BlameDecorations.highlight = vscode_1.window.createTextEditorDecorationType({
                        dark: {
                            backgroundColor: 'rgba(255, 255, 255, 0.15)',
                            overviewRulerColor: 'rgba(255, 255, 255, 0.75)'
                        },
                        light: {
                            backgroundColor: 'rgba(0, 0, 0, 0.15)',
                            overviewRulerColor: 'rgba(0, 0, 0, 0.75)'
                        },
                        overviewRulerLane: vscode_1.OverviewRulerLane.Right,
                        isWholeLine: true
                    });
                    break;
                case 'both':
                    exports.BlameDecorations.highlight = vscode_1.window.createTextEditorDecorationType({
                        dark: {
                            backgroundColor: 'rgba(255, 255, 255, 0.15)',
                            gutterIconPath: this.context.asAbsolutePath('images/blame-dark.svg'),
                            overviewRulerColor: 'rgba(255, 255, 255, 0.75)'
                        },
                        light: {
                            backgroundColor: 'rgba(0, 0, 0, 0.15)',
                            gutterIconPath: this.context.asAbsolutePath('images/blame-light.svg'),
                            overviewRulerColor: 'rgba(0, 0, 0, 0.75)'
                        },
                        gutterIconSize: 'contain',
                        overviewRulerLane: vscode_1.OverviewRulerLane.Right,
                        isWholeLine: true
                    });
                    break;
                default:
                    exports.BlameDecorations.highlight = undefined;
                    break;
            }
        }
        this._config = config;
    }
    clear(column) {
        return __awaiter(this, void 0, void 0, function* () {
            const provider = this._annotationProviders.get(column);
            if (!provider)
                return;
            this._annotationProviders.delete(column);
            yield provider.dispose();
            if (this._annotationProviders.size === 0) {
                logger_1.Logger.log(`Remove listener registrations for blame annotations`);
                this._blameAnnotationsDisposable && this._blameAnnotationsDisposable.dispose();
                this._blameAnnotationsDisposable = undefined;
            }
            this._onDidToggleBlameAnnotationsEmitter.fire();
        });
    }
    showBlameAnnotation(editor, shaOrLine) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!editor || !editor.document || !this.git.isEditorBlameable(editor))
                return false;
            const currentProvider = this._annotationProviders.get(editor.viewColumn || -1);
            if (currentProvider && comparers_1.TextEditorComparer.equals(currentProvider.editor, editor)) {
                yield currentProvider.setSelection(shaOrLine);
                return true;
            }
            const gitUri = yield gitService_1.GitUri.fromUri(editor.document.uri, this.git);
            const provider = new blameAnnotationProvider_1.BlameAnnotationProvider(this.context, this.git, this._whitespaceController, editor, gitUri);
            if (!(yield provider.supportsBlame()))
                return false;
            if (currentProvider) {
                yield this.clear(currentProvider.editor.viewColumn || -1);
            }
            if (!this._blameAnnotationsDisposable && this._annotationProviders.size === 0) {
                logger_1.Logger.log(`Add listener registrations for blame annotations`);
                const subscriptions = [];
                subscriptions.push(vscode_1.window.onDidChangeVisibleTextEditors(system_1.Functions.debounce(this._onVisibleTextEditorsChanged, 100), this));
                subscriptions.push(vscode_1.window.onDidChangeTextEditorViewColumn(this._onTextEditorViewColumnChanged, this));
                subscriptions.push(vscode_1.workspace.onDidCloseTextDocument(this._onTextDocumentClosed, this));
                subscriptions.push(this.gitContextTracker.onDidBlameabilityChange(this._onBlameabilityChanged, this));
                this._blameAnnotationsDisposable = vscode_1.Disposable.from(...subscriptions);
            }
            this._annotationProviders.set(editor.viewColumn || -1, provider);
            if (yield provider.provideBlameAnnotation(shaOrLine)) {
                this._onDidToggleBlameAnnotationsEmitter.fire();
                return true;
            }
            return false;
        });
    }
    isAnnotating(editor) {
        if (!editor || !editor.document || !this.git.isEditorBlameable(editor))
            return false;
        return !!this._annotationProviders.get(editor.viewColumn || -1);
    }
    toggleBlameAnnotation(editor, shaOrLine) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!editor || !editor.document || !this.git.isEditorBlameable(editor))
                return false;
            let provider = this._annotationProviders.get(editor.viewColumn || -1);
            if (!provider)
                return this.showBlameAnnotation(editor, shaOrLine);
            yield this.clear(provider.editor.viewColumn || -1);
            return false;
        });
    }
    _onBlameabilityChanged(e) {
        if (e.blameable || !e.editor)
            return;
        for (const [key, p] of this._annotationProviders) {
            if (!comparers_1.TextDocumentComparer.equals(p.document, e.editor.document))
                continue;
            logger_1.Logger.log('BlameabilityChanged:', `Clear blame annotations for column ${key}`);
            this.clear(key);
        }
    }
    _onTextDocumentClosed(e) {
        for (const [key, p] of this._annotationProviders) {
            if (!comparers_1.TextDocumentComparer.equals(p.document, e))
                continue;
            logger_1.Logger.log('TextDocumentClosed:', `Clear blame annotations for column ${key}`);
            this.clear(key);
        }
    }
    _onTextEditorViewColumnChanged(e) {
        return __awaiter(this, void 0, void 0, function* () {
            const viewColumn = e.viewColumn || -1;
            logger_1.Logger.log('TextEditorViewColumnChanged:', `Clear blame annotations for column ${viewColumn}`);
            yield this.clear(viewColumn);
            for (const [key, p] of this._annotationProviders) {
                if (!comparers_1.TextEditorComparer.equals(p.editor, e.textEditor))
                    continue;
                logger_1.Logger.log('TextEditorViewColumnChanged:', `Clear blame annotations for column ${key}`);
                yield this.clear(key);
            }
        });
    }
    _onVisibleTextEditorsChanged(e) {
        return __awaiter(this, void 0, void 0, function* () {
            if (e.every(_ => _.document.uri.scheme === 'inmemory'))
                return;
            for (const [key, p] of this._annotationProviders) {
                if (e.some(_ => comparers_1.TextEditorComparer.equals(p.editor, _)))
                    continue;
                logger_1.Logger.log('VisibleTextEditorsChanged:', `Clear blame annotations for column ${key}`);
                this.clear(key);
            }
        });
    }
}
exports.BlameAnnotationController = BlameAnnotationController;
//# sourceMappingURL=blameAnnotationController.js.map