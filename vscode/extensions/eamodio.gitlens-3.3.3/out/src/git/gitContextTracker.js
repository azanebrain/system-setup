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
const vscode_1 = require("vscode");
const commands_1 = require("../commands");
const comparers_1 = require("../comparers");
const gitService_1 = require("../gitService");
const logger_1 = require("../logger");
class GitContextTracker extends vscode_1.Disposable {
    constructor(git) {
        super(() => this.dispose());
        this.git = git;
        this._onDidBlameabilityChange = new vscode_1.EventEmitter();
        const subscriptions = [];
        subscriptions.push(vscode_1.window.onDidChangeActiveTextEditor(this._onActiveTextEditorChanged, this));
        subscriptions.push(vscode_1.workspace.onDidChangeConfiguration(this._onConfigurationChanged, this));
        subscriptions.push(vscode_1.workspace.onDidSaveTextDocument(this._onTextDocumentSaved, this));
        subscriptions.push(this.git.onDidBlameFail(this._onBlameFailed, this));
        this._disposable = vscode_1.Disposable.from(...subscriptions);
        commands_1.setCommandContext(commands_1.CommandContext.IsRepository, !!this.git.repoPath);
        this._onConfigurationChanged();
        this._onActiveTextEditorChanged(vscode_1.window.activeTextEditor);
    }
    get onDidBlameabilityChange() {
        return this._onDidBlameabilityChange.event;
    }
    dispose() {
        this._disposable && this._disposable.dispose();
        this._documentChangeDisposable && this._documentChangeDisposable.dispose();
    }
    _onConfigurationChanged() {
        const gitEnabled = vscode_1.workspace.getConfiguration('git').get('enabled');
        if (this._gitEnabled !== gitEnabled) {
            this._gitEnabled = gitEnabled;
            commands_1.setCommandContext(commands_1.CommandContext.Enabled, gitEnabled);
            this._onActiveTextEditorChanged(vscode_1.window.activeTextEditor);
        }
    }
    _onActiveTextEditorChanged(editor) {
        this._editor = editor;
        this._updateContext(this._gitEnabled && editor);
        this._subscribeToDocumentChanges();
    }
    _onBlameFailed(key) {
        const fileName = this._editor && this._editor.document && this._editor.document.fileName;
        if (!fileName || key !== this.git.getCacheEntryKey(fileName))
            return;
        this._updateBlameability(false);
    }
    _onTextDocumentChanged(e) {
        if (!comparers_1.TextDocumentComparer.equals(this._editor && this._editor.document, e && e.document))
            return;
        setTimeout(() => this._updateBlameability(!e.document.isDirty), 1);
    }
    _onTextDocumentSaved(e) {
        if (!comparers_1.TextDocumentComparer.equals(this._editor && this._editor.document, e))
            return;
        this._updateBlameability(!e.isDirty);
    }
    _subscribeToDocumentChanges() {
        this._unsubscribeToDocumentChanges();
        this._documentChangeDisposable = vscode_1.workspace.onDidChangeTextDocument(this._onTextDocumentChanged, this);
    }
    _unsubscribeToDocumentChanges() {
        this._documentChangeDisposable && this._documentChangeDisposable.dispose();
        this._documentChangeDisposable = undefined;
    }
    _updateContext(editor) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const gitUri = editor && (yield gitService_1.GitUri.fromUri(editor.document.uri, this.git));
                yield Promise.all([
                    this._updateEditorContext(gitUri, editor),
                    this._updateContextHasRemotes(gitUri)
                ]);
            }
            catch (ex) {
                logger_1.Logger.error(ex, 'GitEditorTracker._updateContext');
            }
        });
    }
    _updateContextHasRemotes(uri) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let hasRemotes = false;
                if (uri) {
                    const repoPath = uri.repoPath || this.git.repoPath;
                    if (repoPath) {
                        const remotes = yield this.git.getRemotes(repoPath);
                        hasRemotes = remotes.length !== 0;
                    }
                }
                commands_1.setCommandContext(commands_1.CommandContext.HasRemotes, hasRemotes);
            }
            catch (ex) {
                logger_1.Logger.error(ex, 'GitEditorTracker._updateContextHasRemotes');
            }
        });
    }
    _updateEditorContext(uri, editor) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const tracked = uri && (yield this.git.isTracked(uri));
                commands_1.setCommandContext(commands_1.CommandContext.IsTracked, tracked);
                let blameable = tracked && editor && editor.document && !editor.document.isDirty;
                if (blameable) {
                    blameable = yield this.git.getBlameability(uri);
                }
                this._updateBlameability(blameable, true);
            }
            catch (ex) {
                logger_1.Logger.error(ex, 'GitEditorTracker._updateEditorContext');
            }
        });
    }
    _updateBlameability(blameable, force = false) {
        if (!force && this._isBlameable === blameable)
            return;
        try {
            commands_1.setCommandContext(commands_1.CommandContext.IsBlameable, blameable);
            this._onDidBlameabilityChange.fire({
                blameable: blameable,
                editor: this._editor
            });
        }
        catch (ex) {
            logger_1.Logger.error(ex, 'GitEditorTracker._updateBlameability');
        }
    }
}
exports.GitContextTracker = GitContextTracker;
//# sourceMappingURL=gitContextTracker.js.map