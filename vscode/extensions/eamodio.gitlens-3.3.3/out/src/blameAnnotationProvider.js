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
const blameAnnotationFormatter_1 = require("./blameAnnotationFormatter");
const blameAnnotationController_1 = require("./blameAnnotationController");
const comparers_1 = require("./comparers");
const configuration_1 = require("./configuration");
class BlameAnnotationProvider extends vscode_1.Disposable {
    constructor(context, git, whitespaceController, editor, uri) {
        super(() => this.dispose());
        this.git = git;
        this.whitespaceController = whitespaceController;
        this.editor = editor;
        this.uri = uri;
        this.document = this.editor.document;
        this._blame = this.git.getBlameForFile(this.uri);
        this._config = vscode_1.workspace.getConfiguration('gitlens').get('blame');
        const subscriptions = [];
        subscriptions.push(vscode_1.window.onDidChangeTextEditorSelection(this._onActiveSelectionChanged, this));
        this._disposable = vscode_1.Disposable.from(...subscriptions);
    }
    dispose() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.editor) {
                try {
                    this.editor.setDecorations(blameAnnotationController_1.BlameDecorations.annotation, []);
                    blameAnnotationController_1.BlameDecorations.highlight && this.editor.setDecorations(blameAnnotationController_1.BlameDecorations.highlight, []);
                    if (blameAnnotationController_1.BlameDecorations.highlight) {
                        setTimeout(() => this.editor.setDecorations(blameAnnotationController_1.BlameDecorations.highlight, []), 1);
                    }
                }
                catch (ex) { }
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
            let whitespacePromise;
            if (this._config.annotation.style !== configuration_1.BlameAnnotationStyle.Trailing) {
                whitespacePromise = this.whitespaceController && this.whitespaceController.override();
            }
            let blame;
            if (whitespacePromise) {
                [blame] = yield Promise.all([this._blame, whitespacePromise]);
            }
            else {
                blame = yield this._blame;
            }
            if (!blame || !blame.lines.length) {
                this.whitespaceController && (yield this.whitespaceController.restore());
                return false;
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
                this.editor.setDecorations(blameAnnotationController_1.BlameDecorations.annotation, blameDecorationOptions);
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
        if (!blameAnnotationController_1.BlameDecorations.highlight)
            return;
        const offset = this.uri.offset;
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
            this.editor.setDecorations(blameAnnotationController_1.BlameDecorations.highlight, []);
            return;
        }
        const highlightDecorationRanges = blame.lines
            .filter(l => l.sha === sha)
            .map(l => this.editor.document.validateRange(new vscode_1.Range(l.line + offset, 0, l.line + offset, 1000000)));
        this.editor.setDecorations(blameAnnotationController_1.BlameDecorations.highlight, highlightDecorationRanges);
    }
    _getCompactGutterDecorations(blame) {
        const offset = this.uri.offset;
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
                        gutter = commit.shortSha;
                        break;
                    case 1:
                        gutter = `\u2759 ${blameAnnotationFormatter_1.BlameAnnotationFormatter.getAuthor(this._config, commit, blameAnnotationFormatter_1.defaultAuthorLength, true)}`;
                        break;
                    case 2:
                        gutter = `\u2759 ${blameAnnotationFormatter_1.BlameAnnotationFormatter.getDate(this._config, commit, this._config.annotation.dateFormat || 'MM/DD/YYYY', true, true)}`;
                        break;
                    default:
                        gutter = `\u2759`;
                        break;
                }
            }
            const hoverMessage = blameAnnotationFormatter_1.BlameAnnotationFormatter.getAnnotationHover(this._config, l, commit);
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
        const offset = this.uri.offset;
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
            const gutter = blameAnnotationFormatter_1.BlameAnnotationFormatter.getAnnotation(this._config, commit, format);
            const hoverMessage = blameAnnotationFormatter_1.BlameAnnotationFormatter.getAnnotationHover(this._config, l, commit);
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