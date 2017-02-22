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
const constants_1 = require("./constants");
const configuration_1 = require("./configuration");
const gitProvider_1 = require("./gitProvider");
const logger_1 = require("./logger");
const moment = require("moment");
class GitRecentChangeCodeLens extends vscode_1.CodeLens {
    constructor(blame, uri, symbolKind, blameRange, isFullRange, range) {
        super(range);
        this.blame = blame;
        this.uri = uri;
        this.symbolKind = symbolKind;
        this.blameRange = blameRange;
        this.isFullRange = isFullRange;
    }
    getBlame() {
        return this.blame();
    }
}
exports.GitRecentChangeCodeLens = GitRecentChangeCodeLens;
class GitAuthorsCodeLens extends vscode_1.CodeLens {
    constructor(blame, uri, symbolKind, blameRange, isFullRange, range) {
        super(range);
        this.blame = blame;
        this.uri = uri;
        this.symbolKind = symbolKind;
        this.blameRange = blameRange;
        this.isFullRange = isFullRange;
    }
    getBlame() {
        return this.blame();
    }
}
exports.GitAuthorsCodeLens = GitAuthorsCodeLens;
class GitCodeLensProvider {
    constructor(context, git) {
        this.git = git;
        this._onDidChangeCodeLensesEmitter = new vscode_1.EventEmitter();
        this._config = vscode_1.workspace.getConfiguration('').get('gitlens');
    }
    get onDidChangeCodeLenses() {
        return this._onDidChangeCodeLensesEmitter.event;
    }
    reset() {
        logger_1.Logger.log('Triggering a reset of the git CodeLens provider');
        this._onDidChangeCodeLensesEmitter.fire();
    }
    provideCodeLenses(document, token) {
        return __awaiter(this, void 0, void 0, function* () {
            let languageLocations = this._config.codeLens.languageLocations.find(_ => _.language.toLowerCase() === document.languageId);
            if (languageLocations == null) {
                languageLocations = {
                    language: undefined,
                    location: this._config.codeLens.location,
                    customSymbols: this._config.codeLens.locationCustomSymbols
                };
            }
            const lenses = [];
            if (languageLocations.location === configuration_1.CodeLensLocation.None)
                return lenses;
            const gitUri = gitProvider_1.GitUri.fromUri(document.uri, this.git);
            const blamePromise = this.git.getBlameForFile(gitUri.fsPath, gitUri.sha, gitUri.repoPath);
            let blame;
            if (languageLocations.location === configuration_1.CodeLensLocation.Document) {
                blame = yield blamePromise;
                if (!blame || !blame.lines.length)
                    return lenses;
            }
            else {
                const values = yield Promise.all([
                    blamePromise,
                    vscode_1.commands.executeCommand(constants_1.BuiltInCommands.ExecuteDocumentSymbolProvider, document.uri)
                ]);
                blame = values[0];
                if (!blame || !blame.lines.length)
                    return lenses;
                const symbols = values[1];
                logger_1.Logger.log('GitCodeLensProvider.provideCodeLenses:', `${symbols.length} symbol(s) found`);
                symbols.forEach(sym => this._provideCodeLens(gitUri, document, sym, languageLocations, blame, lenses));
            }
            if (languageLocations.location !== configuration_1.CodeLensLocation.Custom || (languageLocations.customSymbols || []).find(_ => _.toLowerCase() === 'file')) {
                if (!lenses.find(l => l.range.start.line === 0 && l.range.end.line === 0)) {
                    const blameRange = document.validateRange(new vscode_1.Range(0, 1000000, 1000000, 1000000));
                    let blameForRangeFn;
                    if (this._config.codeLens.recentChange.enabled) {
                        blameForRangeFn = system_1.Functions.once(() => this.git.getBlameForRangeSync(blame, gitUri.fsPath, blameRange, gitUri.sha, gitUri.repoPath));
                        lenses.push(new GitRecentChangeCodeLens(blameForRangeFn, gitUri, vscode_1.SymbolKind.File, blameRange, true, new vscode_1.Range(0, 0, 0, blameRange.start.character)));
                    }
                    if (this._config.codeLens.authors.enabled) {
                        if (!blameForRangeFn) {
                            blameForRangeFn = system_1.Functions.once(() => this.git.getBlameForRangeSync(blame, gitUri.fsPath, blameRange, gitUri.sha, gitUri.repoPath));
                        }
                        lenses.push(new GitAuthorsCodeLens(blameForRangeFn, gitUri, vscode_1.SymbolKind.File, blameRange, true, new vscode_1.Range(0, 1, 0, blameRange.start.character)));
                    }
                }
            }
            return lenses;
        });
    }
    _isValidSymbol(kind, languageLocation) {
        switch (languageLocation.location) {
            case configuration_1.CodeLensLocation.All:
            case configuration_1.CodeLensLocation.DocumentAndContainers:
                switch (kind) {
                    case vscode_1.SymbolKind.File:
                    case vscode_1.SymbolKind.Package:
                    case vscode_1.SymbolKind.Module:
                    case vscode_1.SymbolKind.Namespace:
                    case vscode_1.SymbolKind.Class:
                    case vscode_1.SymbolKind.Interface:
                        return true;
                    case vscode_1.SymbolKind.Constructor:
                    case vscode_1.SymbolKind.Method:
                    case vscode_1.SymbolKind.Function:
                    case vscode_1.SymbolKind.Property:
                    case vscode_1.SymbolKind.Enum:
                        return languageLocation.location === configuration_1.CodeLensLocation.All;
                    default:
                        return false;
                }
            case configuration_1.CodeLensLocation.Document:
                return false;
            case configuration_1.CodeLensLocation.Custom:
                return !!(languageLocation.customSymbols || []).find(_ => _.toLowerCase() === vscode_1.SymbolKind[kind].toLowerCase());
        }
        return false;
    }
    _provideCodeLens(gitUri, document, symbol, languageLocation, blame, lenses) {
        if (!this._isValidSymbol(symbol.kind, languageLocation))
            return;
        const line = document.lineAt(symbol.location.range.start);
        if (lenses.length && lenses[lenses.length - 1].range.start.line === line.lineNumber)
            return;
        let startChar = -1;
        try {
            startChar = line.text.search(`\\b${system_1.Strings.escapeRegExp(symbol.name)}\\b`);
        }
        catch (ex) { }
        if (startChar === -1) {
            startChar = line.firstNonWhitespaceCharacterIndex;
        }
        else {
            startChar += Math.floor(symbol.name.length / 2);
        }
        let blameForRangeFn;
        if (this._config.codeLens.recentChange.enabled) {
            blameForRangeFn = system_1.Functions.once(() => this.git.getBlameForRangeSync(blame, gitUri.fsPath, symbol.location.range, gitUri.sha, gitUri.repoPath));
            lenses.push(new GitRecentChangeCodeLens(blameForRangeFn, gitUri, symbol.kind, symbol.location.range, false, line.range.with(new vscode_1.Position(line.range.start.line, startChar))));
            startChar++;
        }
        if (this._config.codeLens.authors.enabled) {
            let multiline = !symbol.location.range.isSingleLine;
            if (!multiline && document.languageId === 'csharp') {
                switch (symbol.kind) {
                    case vscode_1.SymbolKind.File:
                    case vscode_1.SymbolKind.Package:
                    case vscode_1.SymbolKind.Module:
                    case vscode_1.SymbolKind.Namespace:
                    case vscode_1.SymbolKind.Class:
                    case vscode_1.SymbolKind.Interface:
                    case vscode_1.SymbolKind.Constructor:
                    case vscode_1.SymbolKind.Method:
                    case vscode_1.SymbolKind.Function:
                    case vscode_1.SymbolKind.Enum:
                        multiline = true;
                        break;
                }
            }
            if (multiline) {
                if (!blameForRangeFn) {
                    blameForRangeFn = system_1.Functions.once(() => this.git.getBlameForRangeSync(blame, gitUri.fsPath, symbol.location.range, gitUri.sha, gitUri.repoPath));
                }
                lenses.push(new GitAuthorsCodeLens(blameForRangeFn, gitUri, symbol.kind, symbol.location.range, false, line.range.with(new vscode_1.Position(line.range.start.line, startChar))));
            }
        }
    }
    resolveCodeLens(lens, token) {
        if (lens instanceof GitRecentChangeCodeLens)
            return this._resolveGitRecentChangeCodeLens(lens, token);
        if (lens instanceof GitAuthorsCodeLens)
            return this._resolveGitAuthorsCodeLens(lens, token);
        return Promise.reject(undefined);
    }
    _resolveGitRecentChangeCodeLens(lens, token) {
        const blame = lens.getBlame();
        const recentCommit = system_1.Iterables.first(blame.commits.values());
        let title = `${recentCommit.author}, ${moment(recentCommit.date).fromNow()}`;
        if (this._config.advanced.debug) {
            title += ` [${recentCommit.sha}, Symbol(${vscode_1.SymbolKind[lens.symbolKind]}), Lines(${lens.blameRange.start.line + 1}-${lens.blameRange.end.line + 1})]`;
        }
        switch (this._config.codeLens.recentChange.command) {
            case configuration_1.CodeLensCommand.BlameAnnotate: return this._applyBlameAnnotateCommand(title, lens, blame);
            case configuration_1.CodeLensCommand.ShowBlameHistory: return this._applyShowBlameHistoryCommand(title, lens, blame, recentCommit);
            case configuration_1.CodeLensCommand.ShowFileHistory: return this._applyShowFileHistoryCommand(title, lens, blame, recentCommit);
            case configuration_1.CodeLensCommand.DiffWithPrevious: return this._applyDiffWithPreviousCommand(title, lens, blame, recentCommit);
            case configuration_1.CodeLensCommand.ShowQuickFileHistory: return this._applyShowQuickFileHistoryCommand(title, lens, blame);
            default: return lens;
        }
    }
    _resolveGitAuthorsCodeLens(lens, token) {
        const blame = lens.getBlame();
        const count = blame.authors.size;
        const title = `${count} ${count > 1 ? 'authors' : 'author'} (${system_1.Iterables.first(blame.authors.values()).name}${count > 1 ? ' and others' : ''})`;
        switch (this._config.codeLens.authors.command) {
            case configuration_1.CodeLensCommand.BlameAnnotate: return this._applyBlameAnnotateCommand(title, lens, blame);
            case configuration_1.CodeLensCommand.ShowBlameHistory: return this._applyShowBlameHistoryCommand(title, lens, blame);
            case configuration_1.CodeLensCommand.ShowFileHistory: return this._applyShowFileHistoryCommand(title, lens, blame);
            case configuration_1.CodeLensCommand.DiffWithPrevious: return this._applyDiffWithPreviousCommand(title, lens, blame);
            case configuration_1.CodeLensCommand.ShowQuickFileHistory: return this._applyShowQuickFileHistoryCommand(title, lens, blame);
            default: return lens;
        }
    }
    _applyBlameAnnotateCommand(title, lens, blame) {
        lens.command = {
            title: title,
            command: constants_1.Commands.ToggleBlame,
            arguments: [vscode_1.Uri.file(lens.uri.fsPath)]
        };
        return lens;
    }
    _applyShowBlameHistoryCommand(title, lens, blame, commit) {
        let line = lens.range.start.line;
        if (commit) {
            const blameLine = commit.lines.find(_ => _.line === line);
            if (blameLine) {
                line = blameLine.originalLine;
            }
        }
        const position = lens.isFullRange ? new vscode_1.Position(1, 0) : lens.range.start;
        lens.command = {
            title: title,
            command: constants_1.Commands.ShowBlameHistory,
            arguments: [vscode_1.Uri.file(lens.uri.fsPath), lens.blameRange, position, commit && commit.sha, line]
        };
        return lens;
    }
    _applyShowFileHistoryCommand(title, lens, blame, commit) {
        let line = lens.range.start.line;
        if (commit) {
            const blameLine = commit.lines.find(_ => _.line === line);
            if (blameLine) {
                line = blameLine.originalLine;
            }
        }
        const position = lens.isFullRange ? new vscode_1.Position(1, 0) : lens.range.start;
        lens.command = {
            title: title,
            command: constants_1.Commands.ShowFileHistory,
            arguments: [vscode_1.Uri.file(lens.uri.fsPath), position, commit && commit.sha, line]
        };
        return lens;
    }
    _applyDiffWithPreviousCommand(title, lens, blame, commit) {
        if (!commit) {
            const blameLine = blame.allLines[lens.range.start.line];
            commit = blame.commits.get(blameLine.sha);
        }
        lens.command = {
            title: title,
            command: constants_1.Commands.DiffWithPrevious,
            arguments: [
                vscode_1.Uri.file(lens.uri.fsPath),
                commit,
                lens.isFullRange ? undefined : lens.blameRange
            ]
        };
        return lens;
    }
    _applyShowQuickFileHistoryCommand(title, lens, blame) {
        lens.command = {
            title: title,
            command: configuration_1.CodeLensCommand.ShowQuickFileHistory,
            arguments: [vscode_1.Uri.file(lens.uri.fsPath)]
        };
        return lens;
    }
}
GitCodeLensProvider.selector = { scheme: constants_1.DocumentSchemes.File };
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = GitCodeLensProvider;
//# sourceMappingURL=gitCodeLensProvider.js.map