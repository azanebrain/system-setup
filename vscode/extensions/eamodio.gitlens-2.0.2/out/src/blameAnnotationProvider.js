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
const gitProvider_1 = require("./gitProvider");
const blameDecoration = vscode_1.window.createTextEditorDecorationType({
    before: {
        margin: '0 1.75em 0 0'
    },
    after: {
        margin: '0 0 0 4em'
    }
});
let highlightDecoration;
class BlameAnnotationProvider extends vscode_1.Disposable {
    constructor(context, git, whitespaceController, editor) {
        super(() => this.dispose());
        this.git = git;
        this.whitespaceController = whitespaceController;
        this.editor = editor;
        if (!highlightDecoration) {
            highlightDecoration = vscode_1.window.createTextEditorDecorationType({
                dark: {
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    gutterIconPath: context.asAbsolutePath('images/blame-dark.png'),
                    overviewRulerColor: 'rgba(255, 255, 255, 0.75)'
                },
                light: {
                    backgroundColor: 'rgba(0, 0, 0, 0.15)',
                    gutterIconPath: context.asAbsolutePath('images/blame-light.png'),
                    overviewRulerColor: 'rgba(0, 0, 0, 0.75)'
                },
                gutterIconSize: 'contain',
                overviewRulerLane: vscode_1.OverviewRulerLane.Right,
                isWholeLine: true
            });
        }
        this.document = this.editor.document;
        this._uri = gitProvider_1.GitUri.fromUri(this.document.uri, this.git);
        this._blame = this.git.getBlameForFile(this._uri.fsPath, this._uri.sha, this._uri.repoPath);
        this._config = vscode_1.workspace.getConfiguration('gitlens').get('blame');
        const subscriptions = [];
        subscriptions.push(vscode_1.window.onDidChangeTextEditorSelection(this._onActiveSelectionChanged, this));
        this._disposable = vscode_1.Disposable.from(...subscriptions);
    }
    dispose() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.editor) {
                this.editor.setDecorations(blameDecoration, []);
                this.editor.setDecorations(highlightDecoration, []);
            }
            this.whitespaceController && (yield this.whitespaceController.restore());
            this._disposable && this._disposable.dispose();
        });
    }
    _onActiveSelectionChanged(e) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!comparers_1.TextDocumentComparer.equals(this.document, e.textEditor && e.textEditor.document))
                return;
            return this.setSelection(e.selections[0].active.line);
        });
    }
    supportsBlame() {
        return __awaiter(this, void 0, void 0, function* () {
            const blame = yield this._blame;
            return !!(blame && blame.lines.length);
        });
    }
    provideBlameAnnotation(shaOrLine) {
        return __awaiter(this, void 0, void 0, function* () {
            const blame = yield this._blame;
            if (!blame || !blame.lines.length)
                return false;
            if (this._config.annotation.style !== configuration_1.BlameAnnotationStyle.Trailing) {
                this.whitespaceController && (yield this.whitespaceController.override());
            }
            let blameDecorationOptions;
            switch (this._config.annotation.style) {
                case configuration_1.BlameAnnotationStyle.Compact:
                    blameDecorationOptions = this._getCompactGutterDecorations(blame);
                    break;
                case configuration_1.BlameAnnotationStyle.Expanded:
                    blameDecorationOptions = this._getExpandedGutterDecorations(blame, false);
                    break;
                case configuration_1.BlameAnnotationStyle.Trailing:
                    blameDecorationOptions = this._getExpandedGutterDecorations(blame, true);
                    break;
            }
            if (blameDecorationOptions) {
                this.editor.setDecorations(blameDecoration, blameDecorationOptions);
            }
            this._setSelection(blame, shaOrLine);
            return true;
        });
    }
    setSelection(shaOrLine) {
        return __awaiter(this, void 0, void 0, function* () {
            const blame = yield this._blame;
            if (!blame || !blame.lines.length)
                return;
            return this._setSelection(blame, shaOrLine);
        });
    }
    _setSelection(blame, shaOrLine) {
        const offset = this._uri.offset;
        let sha;
        if (typeof shaOrLine === 'string') {
            sha = shaOrLine;
        }
        else if (typeof shaOrLine === 'number') {
            const line = shaOrLine - offset;
            if (line >= 0) {
                const commitLine = blame.lines[line];
                sha = commitLine && commitLine.sha;
            }
        }
        else {
            sha = system_1.Iterables.first(blame.commits.values()).sha;
        }
        if (!sha) {
            this.editor.setDecorations(highlightDecoration, []);
            return;
        }
        const highlightDecorationRanges = blame.lines
            .filter(l => l.sha === sha)
            .map(l => this.editor.document.validateRange(new vscode_1.Range(l.line + offset, 0, l.line + offset, 1000000)));
        this.editor.setDecorations(highlightDecoration, highlightDecorationRanges);
    }
    _getCompactGutterDecorations(blame) {
        const offset = this._uri.offset;
        let count = 0;
        let lastSha;
        return blame.lines.map(l => {
            let commit = blame.commits.get(l.sha);
            let color;
            if (commit.isUncommitted) {
                color = 'rgba(0, 188, 242, 0.6)';
            }
            else {
                color = l.previousSha ? '#999999' : '#6b6b6b';
            }
            let gutter = '';
            if (lastSha !== l.sha) {
                count = -1;
            }
            const isEmptyOrWhitespace = this.document.lineAt(l.line).isEmptyOrWhitespace;
            if (!isEmptyOrWhitespace) {
                switch (++count) {
                    case 0:
                        gutter = commit.sha.substring(0, blameAnnotationFormatter_1.defaultShaLength);
                        break;
                    case 1:
                        gutter = `${blameAnnotationFormatter_1.cssIndent} ${blameAnnotationFormatter_1.default.getAuthor(this._config, commit, blameAnnotationFormatter_1.defaultAuthorLength, true)}`;
                        break;
                    case 2:
                        gutter = `${blameAnnotationFormatter_1.cssIndent} ${blameAnnotationFormatter_1.default.getDate(this._config, commit, 'MM/DD/YYYY', true, true)}`;
                        break;
                    default:
                        gutter = `${blameAnnotationFormatter_1.cssIndent}`;
                        break;
                }
            }
            const hoverMessage = blameAnnotationFormatter_1.default.getAnnotationHover(this._config, l, commit);
            gutter = gutter.replace(/\'/g, '\\\'');
            lastSha = l.sha;
            return {
                range: this.editor.document.validateRange(new vscode_1.Range(l.line + offset, 0, l.line + offset, 1000000)),
                hoverMessage: hoverMessage,
                renderOptions: {
                    before: {
                        color: color,
                        contentText: gutter,
                        width: '11em'
                    }
                }
            };
        });
    }
    _getExpandedGutterDecorations(blame, trailing = false) {
        const offset = this._uri.offset;
        let width = 0;
        if (!trailing) {
            if (this._config.annotation.sha) {
                width += 5;
            }
            if (this._config.annotation.date && this._config.annotation.date !== 'off') {
                if (width > 0) {
                    width += 7;
                }
                else {
                    width += 6;
                }
                if (this._config.annotation.date === 'relative') {
                    width += 2;
                }
            }
            if (this._config.annotation.author) {
                if (width > 5 + 6) {
                    width += 12;
                }
                else if (width > 0) {
                    width += 11;
                }
                else {
                    width += 10;
                }
            }
            if (this._config.annotation.message) {
                if (width > 5 + 6 + 10) {
                    width += 21;
                }
                else if (width > 5 + 6) {
                    width += 21;
                }
                else if (width > 0) {
                    width += 21;
                }
                else {
                    width += 19;
                }
            }
        }
        return blame.lines.map(l => {
            let commit = blame.commits.get(l.sha);
            let color;
            if (commit.isUncommitted) {
                color = 'rgba(0, 188, 242, 0.6)';
            }
            else {
                if (trailing) {
                    color = l.previousSha ? 'rgba(153, 153, 153, 0.5)' : 'rgba(107, 107, 107, 0.5)';
                }
                else {
                    color = l.previousSha ? 'rgb(153, 153, 153)' : 'rgb(107, 107, 107)';
                }
            }
            const format = trailing ? blameAnnotationFormatter_1.BlameAnnotationFormat.Unconstrained : blameAnnotationFormatter_1.BlameAnnotationFormat.Constrained;
            const gutter = blameAnnotationFormatter_1.default.getAnnotation(this._config, commit, format).replace(/\'/g, '\\\'');
            const hoverMessage = blameAnnotationFormatter_1.default.getAnnotationHover(this._config, l, commit);
            let renderOptions;
            if (trailing) {
                renderOptions = {
                    after: {
                        color: color,
                        contentText: gutter
                    }
                };
            }
            else {
                renderOptions = {
                    before: {
                        color: color,
                        contentText: gutter,
                        width: `${width}em`
                    }
                };
            }
            return {
                range: this.editor.document.validateRange(new vscode_1.Range(l.line + offset, 0, l.line + offset, 1000000)),
                hoverMessage: hoverMessage,
                renderOptions: renderOptions
            };
        });
    }
}
exports.BlameAnnotationProvider = BlameAnnotationProvider;
//# sourceMappingURL=blameAnnotationProvider.js.map