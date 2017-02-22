'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const system_1 = require("./system");
const vscode_1 = require("vscode");
const blameAnnotationProvider_1 = require("./blameAnnotationProvider");
const comparers_1 = require("./comparers");
const logger_1 = require("./logger");
const whitespaceController_1 = require("./whitespaceController");
class BlameAnnotationController extends vscode_1.Disposable {
    constructor(context, git) {
        super(() => this.dispose());
        this.context = context;
        this.git = git;
        this._annotationProviders = new Map();
        this._onConfigure();
        const subscriptions = [];
        subscriptions.push(vscode_1.workspace.onDidChangeConfiguration(this._onConfigure, this));
        this._disposable = vscode_1.Disposable.from(...subscriptions);
    }
    dispose() {
        this._annotationProviders.forEach((p, i) => __awaiter(this, void 0, void 0, function* () { return yield this.clear(i); }));
        this._blameAnnotationsDisposable && this._blameAnnotationsDisposable.dispose();
        this._whitespaceController && this._whitespaceController.dispose();
        this._disposable && this._disposable.dispose();
    }
    _onConfigure() {
        let toggleWhitespace = vscode_1.workspace.getConfiguration('gitlens.advanced.toggleWhitespace').get('enabled');
        if (!toggleWhitespace) {
            toggleWhitespace = vscode_1.workspace.getConfiguration('editor').get('fontLigatures');
        }
        if (toggleWhitespace && !this._whitespaceController) {
            this._whitespaceController = new whitespaceController_1.default();
        }
        else if (!toggleWhitespace && this._whitespaceController) {
            this._whitespaceController.dispose();
            this._whitespaceController = undefined;
        }
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
        });
    }
    showBlameAnnotation(editor, shaOrLine) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!editor || !editor.document)
                return false;
            if (editor.viewColumn === undefined && !this.git.hasGitUriForFile(editor))
                return false;
            const currentProvider = this._annotationProviders.get(editor.viewColumn || -1);
            if (currentProvider && comparers_1.TextEditorComparer.equals(currentProvider.editor, editor)) {
                yield currentProvider.setSelection(shaOrLine);
                return true;
            }
            const provider = new blameAnnotationProvider_1.BlameAnnotationProvider(this.context, this.git, this._whitespaceController, editor);
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
                this._blameAnnotationsDisposable = vscode_1.Disposable.from(...subscriptions);
            }
            this._annotationProviders.set(editor.viewColumn || -1, provider);
            return provider.provideBlameAnnotation(shaOrLine);
        });
    }
    toggleBlameAnnotation(editor, shaOrLine) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!editor || !editor.document)
                return false;
            if (editor.viewColumn === undefined && !this.git.hasGitUriForFile(editor))
                return false;
            let provider = this._annotationProviders.get(editor.viewColumn || -1);
            if (!provider)
                return this.showBlameAnnotation(editor, shaOrLine);
            yield this.clear(provider.editor.viewColumn || -1);
            return false;
        });
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BlameAnnotationController;
//# sourceMappingURL=blameAnnotationController.js.map