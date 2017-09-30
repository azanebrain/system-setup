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
const system_1 = require("../system");
const vscode_1 = require("vscode");
const annotationProvider_1 = require("./annotationProvider");
const annotations_1 = require("./annotations");
class BlameAnnotationProviderBase extends annotationProvider_1.AnnotationProviderBase {
    constructor(context, editor, decoration, highlightDecoration, whitespaceController, git, uri) {
        super(context, editor, decoration, highlightDecoration, whitespaceController);
        this.git = git;
        this.uri = uri;
        this._blame = this.git.getBlameForFile(this.uri);
    }
    clear() {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            this._hoverProviderDisposable && this._hoverProviderDisposable.dispose();
            _super("clear").call(this);
        });
    }
    selection(shaOrLine, blame) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.highlightDecoration)
                return;
            if (blame === undefined) {
                blame = yield this._blame;
                if (!blame || !blame.lines.length)
                    return;
            }
            const offset = this.uri.offset;
            let sha = undefined;
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
                this.editor.setDecorations(this.highlightDecoration, []);
                return;
            }
            const highlightDecorationRanges = blame.lines
                .filter(l => l.sha === sha)
                .map(l => this.editor.document.validateRange(new vscode_1.Range(l.line + offset, 0, l.line + offset, 1000000)));
            this.editor.setDecorations(this.highlightDecoration, highlightDecorationRanges);
        });
    }
    validate() {
        return __awaiter(this, void 0, void 0, function* () {
            const blame = yield this._blame;
            return blame !== undefined && blame.lines.length !== 0;
        });
    }
    getBlame(requiresWhitespaceHack) {
        return __awaiter(this, void 0, void 0, function* () {
            let whitespacePromise;
            if (requiresWhitespaceHack) {
                whitespacePromise = this.whitespaceController && this.whitespaceController.override();
            }
            let blame;
            if (whitespacePromise !== undefined) {
                [blame] = yield Promise.all([this._blame, whitespacePromise]);
            }
            else {
                blame = yield this._blame;
            }
            if (blame === undefined || blame.lines.length === 0) {
                this.whitespaceController && (yield this.whitespaceController.restore());
                return undefined;
            }
            return blame;
        });
    }
    registerHoverProvider() {
        this._hoverProviderDisposable = vscode_1.languages.registerHoverProvider({ pattern: this.uri.fsPath }, this);
    }
    provideHover(document, position, token) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._config.blame.line.enabled && this.editor.selection.start.line === position.line)
                return undefined;
            const cfg = this._config.annotations.file.gutter;
            if (!cfg.hover.wholeLine && position.character !== 0)
                return undefined;
            const blame = yield this.getBlame(true);
            if (blame === undefined)
                return undefined;
            const line = blame.lines[position.line - this.uri.offset];
            const commit = blame.commits.get(line.sha);
            if (commit === undefined)
                return undefined;
            let logCommit = undefined;
            if (!commit.isUncommitted) {
                logCommit = yield this.git.getLogCommit(commit.repoPath, commit.uri.fsPath, commit.sha);
            }
            const message = annotations_1.Annotations.getHoverMessage(logCommit || commit, this._config.defaultDateFormat, this.git.hasRemotes(commit.repoPath));
            return new vscode_1.Hover(message, document.validateRange(new vscode_1.Range(position.line, 0, position.line, annotations_1.endOfLineIndex)));
        });
    }
}
exports.BlameAnnotationProviderBase = BlameAnnotationProviderBase;
//# sourceMappingURL=blameAnnotationProvider.js.map