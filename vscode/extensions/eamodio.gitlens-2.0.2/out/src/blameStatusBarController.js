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
const blameAnnotationFormatter_1 = require("./blameAnnotationFormatter");
const comparers_1 = require("./comparers");
const configuration_1 = require("./configuration");
const constants_1 = require("./constants");
const gitProvider_1 = require("./gitProvider");
const moment = require("moment");
const activeLineDecoration = vscode_1.window.createTextEditorDecorationType({
    after: {
        margin: '0 0 0 4em'
    }
});
class BlameStatusBarController extends vscode_1.Disposable {
    constructor(context, git) {
        super(() => this.dispose());
        this.git = git;
        this._onConfigure();
        const subscriptions = [];
        subscriptions.push(vscode_1.workspace.onDidChangeConfiguration(this._onConfigure, this));
        subscriptions.push(git.onDidRemoveCacheEntry(this._onRemoveCacheEntry, this));
        this._disposable = vscode_1.Disposable.from(...subscriptions);
    }
    dispose() {
        this._editor && this._editor.setDecorations(activeLineDecoration, []);
        this._activeEditorLineDisposable && this._activeEditorLineDisposable.dispose();
        this._statusBarItem && this._statusBarItem.dispose();
        this._disposable && this._disposable.dispose();
    }
    _onConfigure() {
        const config = vscode_1.workspace.getConfiguration('').get('gitlens');
        let changed = false;
        if (!system_1.Objects.areEquivalent(config.statusBar, this._config && this._config.statusBar)) {
            changed = true;
            if (config.statusBar.enabled) {
                this._statusBarItem = this._statusBarItem || vscode_1.window.createStatusBarItem(vscode_1.StatusBarAlignment.Right, 1000);
                switch (config.statusBar.command) {
                    case configuration_1.StatusBarCommand.ToggleCodeLens:
                        if (config.codeLens.visibility !== 'ondemand') {
                            config.statusBar.command = configuration_1.StatusBarCommand.BlameAnnotate;
                        }
                        break;
                }
                this._statusBarItem.command = config.statusBar.command;
            }
            else if (!config.statusBar.enabled && this._statusBarItem) {
                this._statusBarItem.dispose();
                this._statusBarItem = undefined;
            }
        }
        if (!system_1.Objects.areEquivalent(config.blame.annotation.activeLine, this._config && this._config.blame.annotation.activeLine)) {
            changed = true;
            if (config.blame.annotation.activeLine !== 'off' && this._editor) {
                this._editor.setDecorations(activeLineDecoration, []);
            }
        }
        this._config = config;
        if (!changed)
            return;
        let trackActiveLine = config.statusBar.enabled || config.blame.annotation.activeLine !== 'off';
        if (trackActiveLine && !this._activeEditorLineDisposable) {
            const subscriptions = [];
            subscriptions.push(vscode_1.window.onDidChangeActiveTextEditor(this._onActiveTextEditorChanged, this));
            subscriptions.push(vscode_1.window.onDidChangeTextEditorSelection(this._onEditorSelectionChanged, this));
            subscriptions.push(vscode_1.workspace.onDidChangeTextDocument(this._onDocumentChanged, this));
            this._activeEditorLineDisposable = vscode_1.Disposable.from(...subscriptions);
        }
        else if (!trackActiveLine && this._activeEditorLineDisposable) {
            this._activeEditorLineDisposable.dispose();
            this._activeEditorLineDisposable = undefined;
        }
        this._onActiveTextEditorChanged(vscode_1.window.activeTextEditor);
    }
    _onRemoveCacheEntry() {
        this._blame = undefined;
        this._onActiveTextEditorChanged(vscode_1.window.activeTextEditor);
    }
    _onActiveTextEditorChanged(e) {
        return __awaiter(this, void 0, void 0, function* () {
            const previousEditor = this._editor;
            previousEditor && previousEditor.setDecorations(activeLineDecoration, []);
            if (!e || !e.document || e.document.isUntitled ||
                (e.document.uri.scheme !== constants_1.DocumentSchemes.File && e.document.uri.scheme !== constants_1.DocumentSchemes.Git) ||
                (e.viewColumn === undefined && !this.git.hasGitUriForFile(e))) {
                this.clear(e);
                this._editor = undefined;
                return;
            }
            this._editor = e;
            this._uri = gitProvider_1.GitUri.fromUri(e.document.uri, this.git);
            const maxLines = this._config.advanced.caching.statusBar.maxLines;
            this._useCaching = this._config.advanced.caching.enabled && (maxLines <= 0 || e.document.lineCount <= maxLines);
            if (this._useCaching) {
                this._blame = this.git.getBlameForFile(this._uri.fsPath, this._uri.sha, this._uri.repoPath);
            }
            else {
                this._blame = undefined;
            }
            return yield this._showBlame(e.selection.active.line, e);
        });
    }
    _onEditorSelectionChanged(e) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!comparers_1.TextEditorComparer.equals(e.textEditor, this._editor))
                return;
            return yield this._showBlame(e.selections[0].active.line, e.textEditor);
        });
    }
    _onDocumentChanged(e) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._editor || !comparers_1.TextDocumentComparer.equals(e.document, this._editor.document))
                return;
            return yield this._showBlame(this._editor.selections[0].active.line, this._editor);
        });
    }
    _showBlame(line, editor) {
        return __awaiter(this, void 0, void 0, function* () {
            line = line - this._uri.offset;
            let commitLine;
            let commit;
            if (line >= 0) {
                if (this._useCaching) {
                    const blame = this._blame && (yield this._blame);
                    if (!blame || !blame.lines.length) {
                        this.clear(editor);
                        return;
                    }
                    commitLine = blame.lines[line];
                    const sha = commitLine && commitLine.sha;
                    commit = sha && blame.commits.get(sha);
                }
                else {
                    const blameLine = yield this.git.getBlameForLine(this._uri.fsPath, line, this._uri.sha, this._uri.repoPath);
                    commitLine = blameLine && blameLine.line;
                    commit = blameLine && blameLine.commit;
                }
            }
            if (commit) {
                this.show(commit, commitLine, editor);
            }
            else {
                this.clear(editor);
            }
        });
    }
    clear(editor, previousEditor) {
        editor && editor.setDecorations(activeLineDecoration, []);
        this._statusBarItem && this._statusBarItem.hide();
    }
    show(commit, blameLine, editor) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._config.statusBar.enabled) {
                this._statusBarItem.text = `$(git-commit) ${commit.author}, ${moment(commit.date).fromNow()}`;
                switch (this._config.statusBar.command) {
                    case configuration_1.StatusBarCommand.BlameAnnotate:
                        this._statusBarItem.tooltip = 'Toggle Blame Annotations';
                        break;
                    case configuration_1.StatusBarCommand.ShowBlameHistory:
                        this._statusBarItem.tooltip = 'Open Blame History';
                        break;
                    case configuration_1.StatusBarCommand.ShowFileHistory:
                        this._statusBarItem.tooltip = 'Open File History';
                        break;
                    case configuration_1.StatusBarCommand.DiffWithPrevious:
                        this._statusBarItem.tooltip = 'Compare to Previous Commit';
                        break;
                    case configuration_1.StatusBarCommand.ToggleCodeLens:
                        this._statusBarItem.tooltip = 'Toggle Blame CodeLens';
                        break;
                    case configuration_1.StatusBarCommand.ShowQuickFileHistory:
                        this._statusBarItem.tooltip = 'View Git File History';
                        break;
                }
                this._statusBarItem.show();
            }
            if (this._config.blame.annotation.activeLine !== 'off') {
                let activeLine = this._config.blame.annotation.activeLine;
                if (editor && editor.document && editor.document.isDirty) {
                    editor.setDecorations(activeLineDecoration, []);
                    switch (activeLine) {
                        case 'both':
                            activeLine = 'hover';
                            break;
                        case 'inline':
                            return;
                    }
                }
                const offset = this._uri.offset;
                const config = {
                    annotation: {
                        sha: true,
                        author: this._config.statusBar.enabled ? false : this._config.blame.annotation.author,
                        date: this._config.statusBar.enabled ? 'off' : this._config.blame.annotation.date,
                        message: true
                    }
                };
                const annotation = blameAnnotationFormatter_1.default.getAnnotation(config, commit, blameAnnotationFormatter_1.BlameAnnotationFormat.Unconstrained).replace(/\'/g, '\\\'');
                let logCommit;
                if (!commit.isUncommitted) {
                    const log = yield this.git.getLogForFile(this._uri.fsPath, commit.sha, this._uri.repoPath, undefined, 1);
                    logCommit = log && log.commits.get(commit.sha);
                }
                const hoverMessage = blameAnnotationFormatter_1.default.getAnnotationHover(config, blameLine, logCommit || commit);
                let decorationOptions;
                switch (activeLine) {
                    case 'both':
                        decorationOptions = {
                            range: editor.document.validateRange(new vscode_1.Range(blameLine.line + offset, 0, blameLine.line + offset, 1000000)),
                            hoverMessage: hoverMessage,
                            renderOptions: {
                                after: {
                                    color: 'rgba(153, 153, 153, 0.3)',
                                    contentText: annotation
                                }
                            }
                        };
                        break;
                    case 'inline':
                        decorationOptions = {
                            range: editor.document.validateRange(new vscode_1.Range(blameLine.line + offset, 1000000, blameLine.line + offset, 1000000)),
                            renderOptions: {
                                after: {
                                    color: 'rgba(153, 153, 153, 0.3)',
                                    contentText: annotation
                                }
                            }
                        };
                        break;
                    case 'hover':
                        decorationOptions = {
                            range: editor.document.validateRange(new vscode_1.Range(blameLine.line + offset, 0, blameLine.line + offset, 1000000)),
                            hoverMessage: hoverMessage
                        };
                        break;
                }
                decorationOptions && editor.setDecorations(activeLineDecoration, [decorationOptions]);
            }
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BlameStatusBarController;
//# sourceMappingURL=blameStatusBarController.js.map