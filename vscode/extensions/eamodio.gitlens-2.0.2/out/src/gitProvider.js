'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
const system_1 = require("./system");
const vscode_1 = require("vscode");
const configuration_1 = require("./configuration");
const constants_1 = require("./constants");
const git_1 = require("./git/git");
exports.Git = git_1.default;
const gitUri_1 = require("./git/gitUri");
exports.GitUri = gitUri_1.GitUri;
const gitCodeLensProvider_1 = require("./gitCodeLensProvider");
const logger_1 = require("./logger");
const fs = require("fs");
const ignore = require("ignore");
const moment = require("moment");
const path = require("path");
__export(require("./git/git"));
class UriCacheEntry {
    constructor(uri) {
        this.uri = uri;
    }
}
class GitCacheEntry {
    get hasErrors() {
        return !!((this.blame && this.blame.errorMessage) || (this.log && this.log.errorMessage));
    }
}
var RemoveCacheReason;
(function (RemoveCacheReason) {
    RemoveCacheReason[RemoveCacheReason["DocumentClosed"] = 0] = "DocumentClosed";
    RemoveCacheReason[RemoveCacheReason["DocumentSaved"] = 1] = "DocumentSaved";
})(RemoveCacheReason || (RemoveCacheReason = {}));
class GitProvider extends vscode_1.Disposable {
    constructor(context) {
        super(() => this.dispose());
        this.context = context;
        this._onDidRemoveCacheEntryEmitter = new vscode_1.EventEmitter();
        this._repoPath = context.workspaceState.get(constants_1.WorkspaceState.RepoPath);
        this._onConfigure();
        const subscriptions = [];
        subscriptions.push(vscode_1.workspace.onDidChangeConfiguration(this._onConfigure, this));
        this._disposable = vscode_1.Disposable.from(...subscriptions);
    }
    get onDidRemoveCacheEntry() {
        return this._onDidRemoveCacheEntryEmitter.event;
    }
    dispose() {
        this._disposable && this._disposable.dispose();
        this._codeLensProviderDisposable && this._codeLensProviderDisposable.dispose();
        this._codeLensProviderDisposable = undefined;
        this._codeLensProvider = undefined;
        this._cacheDisposable && this._cacheDisposable.dispose();
        this._uriCache && this._uriCache.clear();
        this._gitCache && this._gitCache.clear();
    }
    get UseUriCaching() {
        return !!this._uriCache;
    }
    get UseGitCaching() {
        return !!this._gitCache;
    }
    _onConfigure() {
        const config = vscode_1.workspace.getConfiguration().get('gitlens');
        const codeLensChanged = !system_1.Objects.areEquivalent(config.codeLens, this.config && this.config.codeLens);
        const advancedChanged = !system_1.Objects.areEquivalent(config.advanced, this.config && this.config.advanced);
        if (codeLensChanged || advancedChanged) {
            logger_1.Logger.log('CodeLens config changed; resetting CodeLens provider');
            if (config.codeLens.visibility === configuration_1.CodeLensVisibility.Auto && (config.codeLens.recentChange.enabled || config.codeLens.authors.enabled)) {
                if (this._codeLensProvider) {
                    this._codeLensProvider.reset();
                }
                else {
                    this._codeLensProvider = new gitCodeLensProvider_1.default(this.context, this);
                    this._codeLensProviderDisposable = vscode_1.languages.registerCodeLensProvider(gitCodeLensProvider_1.default.selector, this._codeLensProvider);
                }
            }
            else {
                this._codeLensProviderDisposable && this._codeLensProviderDisposable.dispose();
                this._codeLensProviderDisposable = undefined;
                this._codeLensProvider = undefined;
            }
        }
        if (advancedChanged) {
            if (config.advanced.caching.enabled) {
                this._gitCache = new Map();
                this._uriCache = new Map();
                const disposables = [];
                disposables.push(vscode_1.workspace.onDidCloseTextDocument(d => this._removeCachedEntry(d, RemoveCacheReason.DocumentClosed)));
                disposables.push(vscode_1.workspace.onDidSaveTextDocument(d => this._removeCachedEntry(d, RemoveCacheReason.DocumentSaved)));
                this._cacheDisposable = vscode_1.Disposable.from(...disposables);
            }
            else {
                this._cacheDisposable && this._cacheDisposable.dispose();
                this._cacheDisposable = undefined;
                this._uriCache && this._uriCache.clear();
                this._uriCache = undefined;
                this._gitCache && this._gitCache.clear();
                this._gitCache = undefined;
            }
            this._gitignore = new Promise((resolve, reject) => {
                if (!config.advanced.gitignore.enabled) {
                    resolve(undefined);
                    return;
                }
                const gitignorePath = path.join(this._repoPath, '.gitignore');
                fs.exists(gitignorePath, e => {
                    if (e) {
                        fs.readFile(gitignorePath, 'utf8', (err, data) => {
                            if (!err) {
                                resolve(ignore().add(data));
                                return;
                            }
                            resolve(undefined);
                        });
                        return;
                    }
                    resolve(undefined);
                });
            });
        }
        this.config = config;
    }
    _getCacheEntryKey(fileName) {
        return fileName.toLowerCase();
    }
    _removeCachedEntry(document, reason) {
        if (!this.UseGitCaching)
            return;
        if (document.uri.scheme !== constants_1.DocumentSchemes.File)
            return;
        const fileName = git_1.default.normalizePath(document.fileName);
        const cacheKey = this._getCacheEntryKey(fileName);
        if (reason === RemoveCacheReason.DocumentClosed) {
            const entry = this._gitCache.get(cacheKey);
            if (entry && entry.hasErrors)
                return;
        }
        if (this._gitCache.delete(cacheKey)) {
            logger_1.Logger.log(`Clear cache entry for '${cacheKey}', reason=${RemoveCacheReason[reason]}`);
            if (reason === RemoveCacheReason.DocumentSaved) {
                this._onDidRemoveCacheEntryEmitter.fire();
                this._codeLensProvider && this._codeLensProvider.reset();
            }
        }
    }
    hasGitUriForFile(fileNameOrEditor) {
        if (!this.UseUriCaching)
            return false;
        let fileName;
        if (typeof fileNameOrEditor === 'string') {
            fileName = fileNameOrEditor;
        }
        else {
            if (!fileNameOrEditor || !fileNameOrEditor.document || !fileNameOrEditor.document.uri)
                return false;
            fileName = fileNameOrEditor.document.uri.fsPath;
        }
        const cacheKey = this._getCacheEntryKey(fileName);
        return this._uriCache.has(cacheKey);
    }
    getGitUriForFile(fileName) {
        if (!this.UseUriCaching)
            return undefined;
        const cacheKey = this._getCacheEntryKey(fileName);
        const entry = this._uriCache.get(cacheKey);
        return entry && entry.uri;
    }
    getRepoPath(cwd) {
        return git_1.default.repoPath(cwd);
    }
    getRepoPathFromFile(fileName) {
        return __awaiter(this, void 0, void 0, function* () {
            const log = yield this.getLogForFile(fileName, undefined, undefined, undefined, 1);
            return log && log.repoPath;
        });
    }
    getBlameForFile(fileName, sha, repoPath) {
        logger_1.Logger.log(`getBlameForFile('${fileName}', ${sha}, ${repoPath})`);
        fileName = git_1.default.normalizePath(fileName);
        const useCaching = this.UseGitCaching && !sha;
        let cacheKey;
        let entry;
        if (useCaching) {
            cacheKey = this._getCacheEntryKey(fileName);
            entry = this._gitCache.get(cacheKey);
            if (entry !== undefined && entry.blame !== undefined)
                return entry.blame.item;
            if (entry === undefined) {
                entry = new GitCacheEntry();
            }
        }
        const promise = this._gitignore.then(ignore => {
            if (ignore && !ignore.filter([fileName]).length) {
                logger_1.Logger.log(`Skipping blame; '${fileName}' is gitignored`);
                return GitProvider.EmptyPromise;
            }
            return git_1.default.blame(GitProvider.BlameFormat, fileName, sha, repoPath)
                .then(data => new git_1.GitBlameParserEnricher(GitProvider.BlameFormat).enrich(data, fileName))
                .catch(ex => {
                if (useCaching) {
                    const msg = ex && ex.toString();
                    logger_1.Logger.log(`Replace blame cache with empty promise for '${cacheKey}'`);
                    entry.blame = {
                        item: GitProvider.EmptyPromise,
                        errorMessage: msg
                    };
                    this._gitCache.set(cacheKey, entry);
                    return GitProvider.EmptyPromise;
                }
                return undefined;
            });
        });
        if (useCaching) {
            logger_1.Logger.log(`Add blame cache for '${cacheKey}'`);
            entry.blame = {
                item: promise
            };
            this._gitCache.set(cacheKey, entry);
        }
        return promise;
    }
    getBlameForLine(fileName, line, sha, repoPath) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.Logger.log(`getBlameForLine('${fileName}', ${line}, ${sha}, ${repoPath})`);
            if (this.UseGitCaching && !sha) {
                const blame = yield this.getBlameForFile(fileName);
                const blameLine = blame && blame.lines[line];
                if (!blameLine)
                    return undefined;
                const commit = blame.commits.get(blameLine.sha);
                return {
                    author: Object.assign({}, blame.authors.get(commit.author), { lineCount: commit.lines.length }),
                    commit: commit,
                    line: blameLine
                };
            }
            fileName = git_1.default.normalizePath(fileName);
            try {
                const data = yield git_1.default.blameLines(GitProvider.BlameFormat, fileName, line + 1, line + 1, sha, repoPath);
                const blame = new git_1.GitBlameParserEnricher(GitProvider.BlameFormat).enrich(data, fileName);
                if (!blame)
                    return undefined;
                const commit = system_1.Iterables.first(blame.commits.values());
                if (repoPath) {
                    commit.repoPath = repoPath;
                }
                return {
                    author: system_1.Iterables.first(blame.authors.values()),
                    commit: commit,
                    line: blame.lines[line]
                };
            }
            catch (ex) {
                return undefined;
            }
        });
    }
    getBlameForRange(fileName, range, sha, repoPath) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.Logger.log(`getBlameForRange('${fileName}', [${range.start.line}, ${range.end.line}], ${sha}, ${repoPath})`);
            const blame = yield this.getBlameForFile(fileName, sha, repoPath);
            if (!blame)
                return undefined;
            return this.getBlameForRangeSync(blame, fileName, range, sha, repoPath);
        });
    }
    getBlameForRangeSync(blame, fileName, range, sha, repoPath) {
        logger_1.Logger.log(`getBlameForRangeSync('${fileName}', [${range.start.line}, ${range.end.line}], ${sha}, ${repoPath})`);
        if (!blame.lines.length)
            return Object.assign({ allLines: blame.lines }, blame);
        if (range.start.line === 0 && range.end.line === blame.lines.length - 1) {
            return Object.assign({ allLines: blame.lines }, blame);
        }
        const lines = blame.lines.slice(range.start.line, range.end.line + 1);
        const shas = new Set();
        lines.forEach(l => shas.add(l.sha));
        const authors = new Map();
        const commits = new Map();
        blame.commits.forEach(c => {
            if (!shas.has(c.sha))
                return;
            const commit = new git_1.GitCommit(c.repoPath, c.sha, c.fileName, c.author, c.date, c.message, c.lines.filter(l => l.line >= range.start.line && l.line <= range.end.line), c.originalFileName, c.previousSha, c.previousFileName);
            commits.set(c.sha, commit);
            let author = authors.get(commit.author);
            if (!author) {
                author = {
                    name: commit.author,
                    lineCount: 0
                };
                authors.set(author.name, author);
            }
            author.lineCount += commit.lines.length;
        });
        const sortedAuthors = new Map();
        Array.from(authors.values())
            .sort((a, b) => b.lineCount - a.lineCount)
            .forEach(a => sortedAuthors.set(a.name, a));
        return {
            authors: sortedAuthors,
            commits: commits,
            lines: lines,
            allLines: blame.lines
        };
    }
    getBlameLocations(fileName, range, sha, repoPath, selectedSha, line) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.Logger.log(`getBlameLocations('${fileName}', [${range.start.line}, ${range.end.line}], ${sha}, ${repoPath})`);
            const blame = yield this.getBlameForRange(fileName, range, sha, repoPath);
            if (!blame)
                return undefined;
            const commitCount = blame.commits.size;
            const locations = [];
            system_1.Iterables.forEach(blame.commits.values(), (c, i) => {
                if (c.isUncommitted)
                    return;
                const decoration = `\u2937 ${c.author}, ${moment(c.date).format('MMMM Do, YYYY h:MMa')}`;
                const uri = GitProvider.toGitUri(c, i + 1, commitCount, c.originalFileName, decoration);
                locations.push(new vscode_1.Location(uri, new vscode_1.Position(0, 0)));
                if (c.sha === selectedSha) {
                    locations.push(new vscode_1.Location(uri, new vscode_1.Position(line + 1, 0)));
                }
            });
            return locations;
        });
    }
    getLogForRepo(repoPath, maxCount) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.Logger.log(`getLogForRepo('${repoPath}', ${maxCount})`);
            if (maxCount == null) {
                maxCount = this.config.advanced.maxQuickHistory || 0;
            }
            try {
                const data = yield git_1.default.logRepo(repoPath, maxCount);
                return new git_1.GitLogParserEnricher().enrich(data, repoPath, true);
            }
            catch (ex) {
                return undefined;
            }
        });
    }
    getLogForFile(fileName, sha, repoPath, range, maxCount) {
        logger_1.Logger.log(`getLogForFile('${fileName}', ${sha}, ${repoPath}, ${range && `[${range.start.line}, ${range.end.line}]`}, ${maxCount})`);
        fileName = git_1.default.normalizePath(fileName);
        const useCaching = this.UseGitCaching && !range && !maxCount;
        let cacheKey;
        let entry;
        if (useCaching) {
            cacheKey = this._getCacheEntryKey(fileName);
            entry = this._gitCache.get(cacheKey);
            if (entry !== undefined && entry.log !== undefined)
                return entry.log.item;
            if (entry === undefined) {
                entry = new GitCacheEntry();
            }
        }
        const promise = this._gitignore.then(ignore => {
            if (ignore && !ignore.filter([fileName]).length) {
                logger_1.Logger.log(`Skipping log; '${fileName}' is gitignored`);
                return GitProvider.EmptyPromise;
            }
            return (range
                ? git_1.default.logRange(fileName, range.start.line + 1, range.end.line + 1, sha, repoPath, maxCount)
                : git_1.default.log(fileName, sha, repoPath, maxCount))
                .then(data => new git_1.GitLogParserEnricher().enrich(data, fileName))
                .catch(ex => {
                if (useCaching) {
                    const msg = ex && ex.toString();
                    logger_1.Logger.log(`Replace log cache with empty promise for '${cacheKey}'`);
                    entry.log = {
                        item: GitProvider.EmptyPromise,
                        errorMessage: msg
                    };
                    this._gitCache.set(cacheKey, entry);
                    return GitProvider.EmptyPromise;
                }
                return undefined;
            });
        });
        if (useCaching) {
            logger_1.Logger.log(`Add log cache for '${cacheKey}'`);
            entry.log = {
                item: promise
            };
            this._gitCache.set(cacheKey, entry);
        }
        return promise;
    }
    getLogLocations(fileName, sha, repoPath, selectedSha, line) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.Logger.log(`getLogLocations('${fileName}', ${sha}, ${repoPath}, ${selectedSha}, ${line})`);
            const log = yield this.getLogForFile(fileName, sha, repoPath);
            if (!log)
                return undefined;
            const commitCount = log.commits.size;
            const locations = [];
            system_1.Iterables.forEach(log.commits.values(), (c, i) => {
                if (c.isUncommitted)
                    return;
                const decoration = `\u2937 ${c.author}, ${moment(c.date).format('MMMM Do, YYYY h:MMa')}`;
                const uri = GitProvider.toGitUri(c, i + 1, commitCount, c.originalFileName, decoration);
                locations.push(new vscode_1.Location(uri, new vscode_1.Position(0, 0)));
                if (c.sha === selectedSha) {
                    locations.push(new vscode_1.Location(uri, new vscode_1.Position(line + 1, 0)));
                }
            });
            return locations;
        });
    }
    getVersionedFile(fileName, repoPath, sha) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.Logger.log(`getVersionedFile('${fileName}', ${repoPath}, ${sha})`);
            const file = yield git_1.default.getVersionedFile(fileName, repoPath, sha);
            if (this.UseUriCaching) {
                const cacheKey = this._getCacheEntryKey(file);
                const entry = new UriCacheEntry(new gitUri_1.GitUri(vscode_1.Uri.file(fileName), { sha, repoPath, fileName }));
                this._uriCache.set(cacheKey, entry);
            }
            return file;
        });
    }
    getVersionedFileText(fileName, repoPath, sha) {
        logger_1.Logger.log(`getVersionedFileText('${fileName}', ${repoPath}, ${sha})`);
        return git_1.default.getVersionedFileText(fileName, repoPath, sha);
    }
    toggleCodeLens(editor) {
        if (this.config.codeLens.visibility !== configuration_1.CodeLensVisibility.OnDemand ||
            (!this.config.codeLens.recentChange.enabled && !this.config.codeLens.authors.enabled))
            return;
        logger_1.Logger.log(`toggleCodeLens(${editor})`);
        if (this._codeLensProviderDisposable) {
            this._codeLensProviderDisposable.dispose();
            this._codeLensProviderDisposable = undefined;
            return;
        }
        this._codeLensProviderDisposable = vscode_1.languages.registerCodeLensProvider(gitCodeLensProvider_1.default.selector, new gitCodeLensProvider_1.default(this.context, this));
    }
    static isUncommitted(sha) {
        return git_1.default.isUncommitted(sha);
    }
    static fromGitUri(uri) {
        if (uri.scheme !== constants_1.DocumentSchemes.Git)
            throw new Error(`fromGitUri(uri=${uri}) invalid scheme`);
        return GitProvider._fromGitUri(uri);
    }
    static _fromGitUri(uri) {
        return JSON.parse(uri.query);
    }
    static toGitUri(commit, index, commitCount, originalFileName, decoration) {
        return GitProvider._toGitUri(commit, constants_1.DocumentSchemes.Git, commitCount, GitProvider._toGitUriData(commit, index, originalFileName, decoration));
    }
    static _toGitUri(commit, scheme, commitCount, data) {
        const pad = (n) => ('0000000' + n).slice(-('' + commitCount).length);
        const ext = path.extname(data.fileName);
        const uriPath = `${path.relative(commit.repoPath, data.fileName.slice(0, -ext.length))}/${commit.sha}${ext}`;
        let message = commit.message;
        if (message.length > 50) {
            message = message.substring(0, 49) + '\u2026';
        }
        return vscode_1.Uri.parse(`${scheme}:${pad(data.index)} \u2022 ${encodeURIComponent(message)} \u2022 ${moment(commit.date).format('MMM D, YYYY hh:MMa')} \u2022 ${encodeURIComponent(uriPath)}?${JSON.stringify(data)}`);
    }
    static _toGitUriData(commit, index, originalFileName, decoration) {
        const fileName = git_1.default.normalizePath(path.join(commit.repoPath, commit.fileName));
        const data = { repoPath: commit.repoPath, fileName: fileName, sha: commit.sha, index: index };
        if (originalFileName) {
            data.originalFileName = git_1.default.normalizePath(path.join(commit.repoPath, originalFileName));
        }
        if (decoration) {
            data.decoration = decoration;
        }
        return data;
    }
}
GitProvider.EmptyPromise = Promise.resolve(undefined);
GitProvider.BlameFormat = git_1.GitBlameFormat.incremental;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = GitProvider;
//# sourceMappingURL=gitProvider.js.map