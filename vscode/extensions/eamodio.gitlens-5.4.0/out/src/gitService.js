'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const system_1 = require("./system");
const vscode_1 = require("vscode");
const constants_1 = require("./constants");
const factory_1 = require("./git/remotes/factory");
const git_1 = require("./git/git");
const gitUri_1 = require("./git/gitUri");
exports.GitUri = gitUri_1.GitUri;
const logger_1 = require("./logger");
const fs = require("fs");
const ignore = require("ignore");
const path = require("path");
__export(require("./git/models/models"));
__export(require("./git/formatters/commit"));
__export(require("./git/formatters/status"));
var provider_1 = require("./git/remotes/provider");
exports.getNameFromRemoteResource = provider_1.getNameFromRemoteResource;
exports.RemoteProvider = provider_1.RemoteProvider;
__export(require("./git/gitContextTracker"));
class UriCacheEntry {
    constructor(uri) {
        this.uri = uri;
    }
}
class GitCacheEntry {
    constructor(key) {
        this.key = key;
        this.cache = new Map();
    }
    get hasErrors() {
        return system_1.Iterables.every(this.cache.values(), _ => _.errorMessage !== undefined);
    }
    get(key) {
        return this.cache.get(key);
    }
    set(key, value) {
        this.cache.set(key, value);
    }
}
var RemoveCacheReason;
(function (RemoveCacheReason) {
    RemoveCacheReason[RemoveCacheReason["DocumentClosed"] = 0] = "DocumentClosed";
    RemoveCacheReason[RemoveCacheReason["DocumentSaved"] = 1] = "DocumentSaved";
})(RemoveCacheReason || (RemoveCacheReason = {}));
exports.GitRepoSearchBy = {
    Author: 'author',
    Files: 'files',
    Message: 'message',
    Sha: 'sha'
};
exports.RepoChangedReasons = {
    Remotes: 'remotes',
    Stash: 'stash',
    Unknown: 'unknown'
};
class GitService extends vscode_1.Disposable {
    constructor(repoPath) {
        super(() => this.dispose());
        this.repoPath = repoPath;
        this._onDidBlameFail = new vscode_1.EventEmitter();
        this._onDidChangeGitCache = new vscode_1.EventEmitter();
        this._onDidChangeFileSystem = new vscode_1.EventEmitter();
        this._onDidChangeRepo = new vscode_1.EventEmitter();
        this._fireGitCacheChangeDebounced = undefined;
        this._fireRepoChangeDebounced = undefined;
        this._repoChangedReasons = [];
        this._gitCache = new Map();
        this._remotesCache = new Map();
        this._uriCache = new Map();
        this._onConfigurationChanged();
        const subscriptions = [];
        subscriptions.push(vscode_1.workspace.onDidChangeConfiguration(this._onConfigurationChanged, this));
        subscriptions.push(factory_1.RemoteProviderFactory.onDidChange(this._onRemoteProviderChanged, this));
        this._disposable = vscode_1.Disposable.from(...subscriptions);
    }
    get onDidBlameFail() {
        return this._onDidBlameFail.event;
    }
    get onDidChangeGitCache() {
        return this._onDidChangeGitCache.event;
    }
    get onDidChangeFileSystem() {
        return this._onDidChangeFileSystem.event;
    }
    get onDidChangeRepo() {
        return this._onDidChangeRepo.event;
    }
    dispose() {
        this.stopWatchingFileSystem();
        this._repoWatcher && this._repoWatcher.dispose();
        this._repoWatcher = undefined;
        this._disposable && this._disposable.dispose();
        this._cacheDisposable && this._cacheDisposable.dispose();
        this._cacheDisposable = undefined;
        this._gitCache.clear();
        this._remotesCache.clear();
        this._uriCache.clear();
    }
    get UseCaching() {
        return this.config.advanced.caching.enabled;
    }
    _onConfigurationChanged() {
        const encoding = vscode_1.workspace.getConfiguration('files').get('encoding', 'utf8');
        git_1.setDefaultEncoding(encoding);
        const cfg = vscode_1.workspace.getConfiguration().get(constants_1.ExtensionKey);
        if (!system_1.Objects.areEquivalent(cfg.advanced, this.config && this.config.advanced)) {
            if (cfg.advanced.caching.enabled) {
                this._cacheDisposable && this._cacheDisposable.dispose();
                this._repoWatcher = this._repoWatcher || vscode_1.workspace.createFileSystemWatcher('**/.git/{index,HEAD,refs/stash,refs/heads/**,refs/remotes/**}');
                const disposables = [];
                disposables.push(vscode_1.workspace.onDidCloseTextDocument(d => this._removeCachedEntry(d, RemoveCacheReason.DocumentClosed)));
                disposables.push(vscode_1.workspace.onDidChangeTextDocument(this._onTextDocumentChanged, this));
                disposables.push(vscode_1.workspace.onDidSaveTextDocument(d => this._removeCachedEntry(d, RemoveCacheReason.DocumentSaved)));
                disposables.push(this._repoWatcher.onDidChange(this._onRepoChanged, this));
                disposables.push(this._repoWatcher.onDidCreate(this._onRepoChanged, this));
                disposables.push(this._repoWatcher.onDidDelete(this._onRepoChanged, this));
                this._cacheDisposable = vscode_1.Disposable.from(...disposables);
            }
            else {
                this._cacheDisposable && this._cacheDisposable.dispose();
                this._cacheDisposable = undefined;
                this._repoWatcher && this._repoWatcher.dispose();
                this._repoWatcher = undefined;
                this._gitCache.clear();
            }
            this._gitignore = new Promise((resolve, reject) => {
                if (!cfg.advanced.gitignore.enabled) {
                    resolve(undefined);
                    return;
                }
                const gitignorePath = path.join(this.repoPath, '.gitignore');
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
        const ignoreWhitespace = this.config && this.config.blame.ignoreWhitespace;
        this.config = cfg;
        if (this.config.blame.ignoreWhitespace !== ignoreWhitespace) {
            this._gitCache.clear();
            this._fireGitCacheChange();
        }
    }
    _onRemoteProviderChanged() {
        this._remotesCache.clear();
        this._fireRepoChange(exports.RepoChangedReasons.Remotes);
    }
    _onTextDocumentChanged(e) {
        if (!this.UseCaching)
            return;
        if (e.document.uri.scheme !== constants_1.DocumentSchemes.File)
            return;
        setTimeout(() => {
            if (e.document.isDirty)
                return;
            this._removeCachedEntry(e.document, RemoveCacheReason.DocumentSaved);
        }, 1);
    }
    _onRepoChanged(uri) {
        if (uri !== undefined && uri.path.endsWith('ref/stash')) {
            this._fireRepoChange('stash');
            return;
        }
        this._gitCache.clear();
        this._fireRepoChange();
        this._fireGitCacheChange();
    }
    _fireGitCacheChange() {
        if (this._fireGitCacheChangeDebounced === undefined) {
            this._fireGitCacheChangeDebounced = system_1.Functions.debounce(this._fireGitCacheChangeCore, 50);
        }
        return this._fireGitCacheChangeDebounced();
    }
    _fireGitCacheChangeCore() {
        this._onDidChangeGitCache.fire();
    }
    _fireRepoChange(reason = 'unknown') {
        if (this._fireRepoChangeDebounced === undefined) {
            this._fireRepoChangeDebounced = system_1.Functions.debounce(this._fireRepoChangeCore, 50);
        }
        this._repoChangedReasons.push(reason);
        return this._fireRepoChangeDebounced();
    }
    _fireRepoChangeCore() {
        const reasons = this._repoChangedReasons;
        this._repoChangedReasons = [];
        this._onDidChangeRepo.fire(reasons);
    }
    _removeCachedEntry(document, reason) {
        if (!this.UseCaching)
            return;
        if (document.uri.scheme !== constants_1.DocumentSchemes.File)
            return;
        const cacheKey = this.getCacheEntryKey(document.uri);
        if (reason === RemoveCacheReason.DocumentSaved) {
            const entry = this._gitCache.get(cacheKey);
            if (entry && entry.hasErrors)
                return;
        }
        if (this._gitCache.delete(cacheKey)) {
            logger_1.Logger.log(`Clear cache entry for '${cacheKey}', reason=${RemoveCacheReason[reason]}`);
            if (reason === RemoveCacheReason.DocumentSaved) {
                this._fireGitCacheChange();
            }
        }
    }
    checkoutFile(uri, sha) {
        sha = sha || uri.sha;
        logger_1.Logger.log(`checkoutFile('${uri.repoPath}', '${uri.fsPath}', ${sha})`);
        return git_1.Git.checkout(uri.repoPath, uri.fsPath, sha);
    }
    _fileExists(repoPath, fileName) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield new Promise((resolve, reject) => fs.exists(path.resolve(repoPath, fileName), resolve));
        });
    }
    findNextCommit(repoPath, fileName, sha) {
        return __awaiter(this, void 0, void 0, function* () {
            let log = yield this.getLogForFile(repoPath, fileName, sha, { maxCount: 1, reverse: true });
            let commit = log && system_1.Iterables.first(log.commits.values());
            if (commit)
                return commit;
            const nextFileName = yield this.findNextFileName(repoPath, fileName, sha);
            if (nextFileName) {
                log = yield this.getLogForFile(repoPath, nextFileName, sha, { maxCount: 1, reverse: true });
                commit = log && system_1.Iterables.first(log.commits.values());
            }
            return commit;
        });
    }
    findNextFileName(repoPath, fileName, sha) {
        return __awaiter(this, void 0, void 0, function* () {
            [fileName, repoPath] = git_1.Git.splitPath(fileName, repoPath);
            return (yield this._fileExists(repoPath, fileName))
                ? fileName
                : yield this._findNextFileName(repoPath, fileName, sha);
        });
    }
    _findNextFileName(repoPath, fileName, sha) {
        return __awaiter(this, void 0, void 0, function* () {
            if (sha === undefined) {
                const c = yield this.getLogCommit(repoPath, fileName);
                if (c === undefined)
                    return undefined;
                sha = c.sha;
            }
            const log = yield this.getLogForRepo(repoPath, sha, 1);
            if (log === undefined)
                return undefined;
            const c = system_1.Iterables.first(log.commits.values());
            const status = c.fileStatuses.find(_ => _.originalFileName === fileName);
            if (status === undefined)
                return undefined;
            return status.fileName;
        });
    }
    findWorkingFileName(commitOrRepoPath, fileName) {
        return __awaiter(this, void 0, void 0, function* () {
            let repoPath;
            if (commitOrRepoPath === undefined || typeof commitOrRepoPath === 'string') {
                repoPath = commitOrRepoPath;
                if (fileName === undefined)
                    throw new Error('Invalid fileName');
                [fileName] = git_1.Git.splitPath(fileName, repoPath);
            }
            else {
                const c = commitOrRepoPath;
                repoPath = c.repoPath;
                if (c.workingFileName && (yield this._fileExists(repoPath, c.workingFileName)))
                    return c.workingFileName;
                fileName = c.fileName;
            }
            while (true) {
                if (yield this._fileExists(repoPath, fileName))
                    return fileName;
                fileName = yield this._findNextFileName(repoPath, fileName);
                if (fileName === undefined)
                    return undefined;
            }
        });
    }
    getBlameability(uri) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.UseCaching)
                return yield this.isTracked(uri);
            const cacheKey = this.getCacheEntryKey(uri);
            const entry = this._gitCache.get(cacheKey);
            if (entry === undefined)
                return yield this.isTracked(uri);
            return !entry.hasErrors;
        });
    }
    getBlameForFile(uri) {
        return __awaiter(this, void 0, void 0, function* () {
            let key = 'blame';
            if (uri.sha !== undefined) {
                key += `:${uri.sha}`;
            }
            let entry;
            if (this.UseCaching) {
                const cacheKey = this.getCacheEntryKey(uri);
                entry = this._gitCache.get(cacheKey);
                if (entry !== undefined) {
                    const cachedBlame = entry.get(key);
                    if (cachedBlame !== undefined) {
                        logger_1.Logger.log(`Cached(${key}): getBlameForFile('${uri.repoPath}', '${uri.fsPath}', ${uri.sha})`);
                        return cachedBlame.item;
                    }
                }
                logger_1.Logger.log(`Not Cached(${key}): getBlameForFile('${uri.repoPath}', '${uri.fsPath}', ${uri.sha})`);
                if (entry === undefined) {
                    entry = new GitCacheEntry(cacheKey);
                    this._gitCache.set(entry.key, entry);
                }
            }
            else {
                logger_1.Logger.log(`getBlameForFile('${uri.repoPath}', '${uri.fsPath}', ${uri.sha})`);
            }
            const promise = this._getBlameForFile(uri, entry, key);
            if (entry) {
                logger_1.Logger.log(`Add blame cache for '${entry.key}:${key}'`);
                entry.set(key, {
                    item: promise
                });
            }
            return promise;
        });
    }
    _getBlameForFile(uri, entry, key) {
        return __awaiter(this, void 0, void 0, function* () {
            const [file, root] = git_1.Git.splitPath(uri.fsPath, uri.repoPath, false);
            const ignore = yield this._gitignore;
            if (ignore && !ignore.filter([file]).length) {
                logger_1.Logger.log(`Skipping blame; '${uri.fsPath}' is gitignored`);
                if (entry && entry.key) {
                    this._onDidBlameFail.fire(entry.key);
                }
                return yield GitService.EmptyPromise;
            }
            try {
                const data = yield git_1.Git.blame(root, file, uri.sha, { ignoreWhitespace: this.config.blame.ignoreWhitespace });
                const blame = git_1.GitBlameParser.parse(data, root, file);
                return blame;
            }
            catch (ex) {
                if (entry) {
                    const msg = ex && ex.toString();
                    logger_1.Logger.log(`Replace blame cache with empty promise for '${entry.key}:${key}'`);
                    entry.set(key, {
                        item: GitService.EmptyPromise,
                        errorMessage: msg
                    });
                    this._onDidBlameFail.fire(entry.key);
                    return yield GitService.EmptyPromise;
                }
                return undefined;
            }
        });
    }
    getBlameForLine(uri, line) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.Logger.log(`getBlameForLine('${uri.repoPath}', '${uri.fsPath}', ${line}, ${uri.sha})`);
            if (this.UseCaching) {
                const blame = yield this.getBlameForFile(uri);
                if (blame === undefined)
                    return undefined;
                let blameLine = blame.lines[line];
                if (blameLine === undefined) {
                    if (blame.lines.length !== line)
                        return undefined;
                    blameLine = blame.lines[line - 1];
                }
                const commit = blame.commits.get(blameLine.sha);
                if (commit === undefined)
                    return undefined;
                return {
                    author: Object.assign({}, blame.authors.get(commit.author), { lineCount: commit.lines.length }),
                    commit: commit,
                    line: blameLine
                };
            }
            const fileName = uri.fsPath;
            try {
                const data = yield git_1.Git.blame(uri.repoPath, fileName, uri.sha, { ignoreWhitespace: this.config.blame.ignoreWhitespace, startLine: line + 1, endLine: line + 1 });
                const blame = git_1.GitBlameParser.parse(data, uri.repoPath, fileName);
                if (blame === undefined)
                    return undefined;
                const commit = system_1.Iterables.first(blame.commits.values());
                if (uri.repoPath) {
                    commit.repoPath = uri.repoPath;
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
    getBlameForRange(uri, range) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.Logger.log(`getBlameForRange('${uri.repoPath}', '${uri.fsPath}', [${range.start.line}, ${range.end.line}], ${uri.sha})`);
            const blame = yield this.getBlameForFile(uri);
            if (blame === undefined)
                return undefined;
            return this.getBlameForRangeSync(blame, uri, range);
        });
    }
    getBlameForRangeSync(blame, uri, range) {
        logger_1.Logger.log(`getBlameForRangeSync('${uri.repoPath}', '${uri.fsPath}', [${range.start.line}, ${range.end.line}], ${uri.sha})`);
        if (blame.lines.length === 0)
            return Object.assign({ allLines: blame.lines }, blame);
        if (range.start.line === 0 && range.end.line === blame.lines.length - 1) {
            return Object.assign({ allLines: blame.lines }, blame);
        }
        const lines = blame.lines.slice(range.start.line, range.end.line + 1);
        const shas = new Set(lines.map(l => l.sha));
        const authors = new Map();
        const commits = new Map();
        for (const c of blame.commits.values()) {
            if (!shas.has(c.sha))
                continue;
            const commit = new git_1.GitBlameCommit(c.repoPath, c.sha, c.fileName, c.author, c.date, c.message, c.lines.filter(l => l.line >= range.start.line && l.line <= range.end.line), c.originalFileName, c.previousSha, c.previousFileName);
            commits.set(c.sha, commit);
            let author = authors.get(commit.author);
            if (author === undefined) {
                author = {
                    name: commit.author,
                    lineCount: 0
                };
                authors.set(author.name, author);
            }
            author.lineCount += commit.lines.length;
        }
        const sortedAuthors = new Map([...authors.entries()].sort((a, b) => b[1].lineCount - a[1].lineCount));
        return {
            authors: sortedAuthors,
            commits: commits,
            lines: lines,
            allLines: blame.lines
        };
    }
    getBlameLocations(uri, range, selectedSha, line) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.Logger.log(`getBlameLocations('${uri.repoPath}', '${uri.fsPath}', [${range.start.line}, ${range.end.line}], ${uri.sha})`);
            const blame = yield this.getBlameForRange(uri, range);
            if (blame === undefined)
                return undefined;
            const commitCount = blame.commits.size;
            const dateFormat = this.config.defaultDateFormat === null ? 'MMMM Do, YYYY h:MMa' : this.config.defaultDateFormat;
            const locations = [];
            system_1.Iterables.forEach(blame.commits.values(), (c, i) => {
                if (c.isUncommitted)
                    return;
                const decoration = `${constants_1.GlyphChars.ArrowDropRight} ${c.author}, ${c.formatDate(dateFormat)}`;
                const uri = GitService.toReferenceGitContentUri(c, i + 1, commitCount, c.originalFileName, decoration, dateFormat);
                locations.push(new vscode_1.Location(uri, new vscode_1.Position(0, 0)));
                if (c.sha === selectedSha) {
                    locations.push(new vscode_1.Location(uri, new vscode_1.Position((line || 0) + 1, 0)));
                }
            });
            return locations;
        });
    }
    getBranch(repoPath) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.Logger.log(`getBranch('${repoPath}')`);
            const data = yield git_1.Git.branch_current(repoPath);
            const branch = data.split('\n');
            return new git_1.GitBranch(repoPath, branch[0], true, branch[1]);
        });
    }
    getBranches(repoPath) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.Logger.log(`getBranches('${repoPath}')`);
            const data = yield git_1.Git.branch(repoPath, { all: true });
            return git_1.GitBranchParser.parse(data, repoPath) || [];
        });
    }
    getCacheEntryKey(fileNameOrUri) {
        return git_1.Git.normalizePath(typeof fileNameOrUri === 'string' ? fileNameOrUri : fileNameOrUri.fsPath).toLowerCase();
    }
    getChangedFilesCount(repoPath, sha) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield git_1.Git.diff_shortstat(repoPath, sha);
            return git_1.GitDiffParser.parseShortStat(data);
        });
    }
    getConfig(key, repoPath) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.Logger.log(`getConfig('${key}', '${repoPath}')`);
            return yield git_1.Git.config_get(key, repoPath);
        });
    }
    getGitUriForFile(uri) {
        const cacheKey = this.getCacheEntryKey(uri);
        const entry = this._uriCache.get(cacheKey);
        return entry && entry.uri;
    }
    getDiffForFile(uri, sha1, sha2) {
        return __awaiter(this, void 0, void 0, function* () {
            if (sha1 !== undefined && sha2 === undefined && uri.sha !== undefined) {
                sha2 = uri.sha;
            }
            let key = 'diff';
            if (sha1 !== undefined) {
                key += `:${sha1}`;
            }
            if (sha2 !== undefined) {
                key += `:${sha2}`;
            }
            let entry;
            if (this.UseCaching) {
                const cacheKey = this.getCacheEntryKey(uri);
                entry = this._gitCache.get(cacheKey);
                if (entry !== undefined) {
                    const cachedDiff = entry.get(key);
                    if (cachedDiff !== undefined) {
                        logger_1.Logger.log(`Cached(${key}): getDiffForFile('${uri.repoPath}', '${uri.fsPath}', ${sha1}, ${sha2})`);
                        return cachedDiff.item;
                    }
                }
                logger_1.Logger.log(`Not Cached(${key}): getDiffForFile('${uri.repoPath}', '${uri.fsPath}', ${sha1}, ${sha2})`);
                if (entry === undefined) {
                    entry = new GitCacheEntry(cacheKey);
                    this._gitCache.set(entry.key, entry);
                }
            }
            else {
                logger_1.Logger.log(`getDiffForFile('${uri.repoPath}', '${uri.fsPath}', ${sha1}, ${sha2})`);
            }
            const promise = this._getDiffForFile(uri.repoPath, uri.fsPath, sha1, sha2, entry, key);
            if (entry) {
                logger_1.Logger.log(`Add log cache for '${entry.key}:${key}'`);
                entry.set(key, {
                    item: promise
                });
            }
            return promise;
        });
    }
    _getDiffForFile(repoPath, fileName, sha1, sha2, entry, key) {
        return __awaiter(this, void 0, void 0, function* () {
            const [file, root] = git_1.Git.splitPath(fileName, repoPath, false);
            try {
                const data = yield git_1.Git.diff(root, file, sha1, sha2);
                const diff = git_1.GitDiffParser.parse(data);
                return diff;
            }
            catch (ex) {
                if (entry) {
                    const msg = ex && ex.toString();
                    logger_1.Logger.log(`Replace diff cache with empty promise for '${entry.key}:${key}'`);
                    entry.set(key, {
                        item: GitService.EmptyPromise,
                        errorMessage: msg
                    });
                    return yield GitService.EmptyPromise;
                }
                return undefined;
            }
        });
    }
    getDiffForLine(uri, line, sha1, sha2) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const diff = yield this.getDiffForFile(uri, sha1, sha2);
                if (diff === undefined)
                    return undefined;
                const chunk = diff.chunks.find(_ => _.currentPosition.start <= line && _.currentPosition.end >= line);
                if (chunk === undefined)
                    return undefined;
                return chunk.lines[line - chunk.currentPosition.start + 1];
            }
            catch (ex) {
                return undefined;
            }
        });
    }
    getLogCommit(repoPath, fileName, shaOrOptions, options) {
        return __awaiter(this, void 0, void 0, function* () {
            let sha = undefined;
            if (typeof shaOrOptions === 'string') {
                sha = shaOrOptions;
            }
            else if (options === undefined) {
                options = shaOrOptions;
            }
            options = options || {};
            const log = yield this.getLogForFile(repoPath, fileName, sha, { maxCount: options.previous ? 2 : 1 });
            if (log === undefined)
                return undefined;
            const commit = sha && log.commits.get(sha);
            if (commit === undefined && sha && !options.firstIfMissing)
                return undefined;
            return commit || system_1.Iterables.first(log.commits.values());
        });
    }
    getLogForRepo(repoPath, sha, maxCount, reverse = false) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.Logger.log(`getLogForRepo('${repoPath}', ${sha}, ${maxCount})`);
            if (maxCount == null) {
                maxCount = this.config.advanced.maxQuickHistory || 0;
            }
            try {
                const data = yield git_1.Git.log(repoPath, sha, maxCount, reverse);
                const log = git_1.GitLogParser.parse(data, 'branch', repoPath, undefined, sha, maxCount, reverse, undefined);
                return log;
            }
            catch (ex) {
                return undefined;
            }
        });
    }
    getLogForRepoSearch(repoPath, search, searchBy, maxCount) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.Logger.log(`getLogForRepoSearch('${repoPath}', ${search}, ${searchBy}, ${maxCount})`);
            if (maxCount == null) {
                maxCount = this.config.advanced.maxQuickHistory || 0;
            }
            let searchArgs = undefined;
            switch (searchBy) {
                case exports.GitRepoSearchBy.Author:
                    searchArgs = [`--author=${search}`];
                    break;
                case exports.GitRepoSearchBy.Files:
                    searchArgs = [`--`, `${search}`];
                    break;
                case exports.GitRepoSearchBy.Message:
                    searchArgs = [`--grep=${search}`];
                    break;
                case exports.GitRepoSearchBy.Sha:
                    searchArgs = [search];
                    maxCount = 1;
                    break;
            }
            try {
                const data = yield git_1.Git.log_search(repoPath, searchArgs, maxCount);
                const log = git_1.GitLogParser.parse(data, 'branch', repoPath, undefined, undefined, maxCount, false, undefined);
                return log;
            }
            catch (ex) {
                return undefined;
            }
        });
    }
    getLogForFile(repoPath, fileName, sha, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            options = Object.assign({ reverse: false, skipMerges: false }, options);
            let key = 'log';
            if (sha !== undefined) {
                key += `:${sha}`;
            }
            if (options.maxCount !== undefined) {
                key += `:n${options.maxCount}`;
            }
            let entry;
            if (this.UseCaching && options.range === undefined && !options.reverse) {
                const cacheKey = this.getCacheEntryKey(fileName);
                entry = this._gitCache.get(cacheKey);
                if (entry !== undefined) {
                    const cachedLog = entry.get(key);
                    if (cachedLog !== undefined) {
                        logger_1.Logger.log(`Cached(${key}): getLogForFile('${repoPath}', '${fileName}', ${sha}, ${options.maxCount}, undefined, false)`);
                        return cachedLog.item;
                    }
                    if (key !== 'log') {
                        const cachedLog = entry.get('log');
                        if (cachedLog !== undefined) {
                            if (sha === undefined) {
                                logger_1.Logger.log(`Cached(~${key}): getLogForFile('${repoPath}', '${fileName}', ${sha}, ${options.maxCount}, undefined, false)`);
                                return cachedLog.item;
                            }
                            logger_1.Logger.log(`? Cache(${key}): getLogForFile('${repoPath}', '${fileName}', ${sha}, ${options.maxCount}, undefined, false)`);
                            const log = yield cachedLog.item;
                            if (log !== undefined && log.commits.has(sha)) {
                                logger_1.Logger.log(`Cached(${key}): getLogForFile('${repoPath}', '${fileName}', ${sha}, ${options.maxCount}, undefined, false)`);
                                return cachedLog.item;
                            }
                        }
                    }
                }
                logger_1.Logger.log(`Not Cached(${key}): getLogForFile('${repoPath}', '${fileName}', ${sha}, ${options.maxCount}, undefined, false)`);
                if (entry === undefined) {
                    entry = new GitCacheEntry(cacheKey);
                    this._gitCache.set(entry.key, entry);
                }
            }
            else {
                logger_1.Logger.log(`getLogForFile('${repoPath}', '${fileName}', ${sha}, ${options.maxCount}, ${options.range && `[${options.range.start.line}, ${options.range.end.line}]`}, ${options.reverse})`);
            }
            const promise = this._getLogForFile(repoPath, fileName, sha, options, entry, key);
            if (entry) {
                logger_1.Logger.log(`Add log cache for '${entry.key}:${key}'`);
                entry.set(key, {
                    item: promise
                });
            }
            return promise;
        });
    }
    _getLogForFile(repoPath, fileName, sha, options, entry, key) {
        return __awaiter(this, void 0, void 0, function* () {
            const [file, root] = git_1.Git.splitPath(fileName, repoPath, false);
            const ignore = yield this._gitignore;
            if (ignore && !ignore.filter([file]).length) {
                logger_1.Logger.log(`Skipping log; '${fileName}' is gitignored`);
                return yield GitService.EmptyPromise;
            }
            try {
                const { range } = options, opts = __rest(options, ["range"]);
                const data = yield git_1.Git.log_file(root, file, sha, Object.assign({}, opts, { startLine: range && range.start.line + 1, endLine: range && range.end.line + 1 }));
                const log = git_1.GitLogParser.parse(data, 'file', root, file, sha, options.maxCount, options.reverse, range);
                return log;
            }
            catch (ex) {
                if (entry) {
                    const msg = ex && ex.toString();
                    logger_1.Logger.log(`Replace log cache with empty promise for '${entry.key}:${key}'`);
                    entry.set(key, {
                        item: GitService.EmptyPromise,
                        errorMessage: msg
                    });
                    return yield GitService.EmptyPromise;
                }
                return undefined;
            }
        });
    }
    getLogLocations(uri, selectedSha, line) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.Logger.log(`getLogLocations('${uri.repoPath}', '${uri.fsPath}', ${uri.sha}, ${selectedSha}, ${line})`);
            const log = yield this.getLogForFile(uri.repoPath, uri.fsPath, uri.sha);
            if (log === undefined)
                return undefined;
            const commitCount = log.commits.size;
            const dateFormat = this.config.defaultDateFormat === null ? 'MMMM Do, YYYY h:MMa' : this.config.defaultDateFormat;
            const locations = [];
            system_1.Iterables.forEach(log.commits.values(), (c, i) => {
                if (c.isUncommitted)
                    return;
                const decoration = `${constants_1.GlyphChars.ArrowDropRight} ${c.author}, ${c.formatDate(dateFormat)}`;
                const uri = GitService.toReferenceGitContentUri(c, i + 1, commitCount, c.originalFileName, decoration, dateFormat);
                locations.push(new vscode_1.Location(uri, new vscode_1.Position(0, 0)));
                if (c.sha === selectedSha) {
                    locations.push(new vscode_1.Location(uri, new vscode_1.Position((line || 0) + 1, 0)));
                }
            });
            return locations;
        });
    }
    hasRemotes(repoPath) {
        const remotes = this._remotesCache.get(repoPath);
        return remotes !== undefined && remotes.length > 0;
    }
    getRemotes(repoPath) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!repoPath)
                return [];
            logger_1.Logger.log(`getRemotes('${repoPath}')`);
            let remotes = this._remotesCache.get(repoPath);
            if (remotes !== undefined)
                return remotes;
            const data = yield git_1.Git.remote(repoPath);
            remotes = git_1.GitRemoteParser.parse(data, repoPath);
            if (remotes !== undefined) {
                this._remotesCache.set(repoPath, remotes);
            }
            return remotes;
        });
    }
    getRepoPath(cwd) {
        return GitService.getRepoPath(cwd);
    }
    getRepoPathFromFile(fileName) {
        return __awaiter(this, void 0, void 0, function* () {
            const log = yield this.getLogForFile(undefined, fileName, undefined, { maxCount: 1 });
            if (log === undefined)
                return undefined;
            return log.repoPath;
        });
    }
    getRepoPathFromUri(uri) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(uri instanceof vscode_1.Uri))
                return this.repoPath;
            const repoPath = (yield gitUri_1.GitUri.fromUri(uri, this)).repoPath;
            if (!repoPath)
                return this.repoPath;
            return repoPath;
        });
    }
    getStashList(repoPath) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.Logger.log(`getStash('${repoPath}')`);
            const data = yield git_1.Git.stash_list(repoPath);
            const stash = git_1.GitStashParser.parse(data, repoPath);
            return stash;
        });
    }
    getStatusForFile(repoPath, fileName) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.Logger.log(`getStatusForFile('${repoPath}', '${fileName}')`);
            const porcelainVersion = git_1.Git.validateVersion(2, 11) ? 2 : 1;
            const data = yield git_1.Git.status_file(repoPath, fileName, porcelainVersion);
            const status = git_1.GitStatusParser.parse(data, repoPath, porcelainVersion);
            if (status === undefined || !status.files.length)
                return undefined;
            return status.files[0];
        });
    }
    getStatusForRepo(repoPath) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.Logger.log(`getStatusForRepo('${repoPath}')`);
            const porcelainVersion = git_1.Git.validateVersion(2, 11) ? 2 : 1;
            const data = yield git_1.Git.status(repoPath, porcelainVersion);
            const status = git_1.GitStatusParser.parse(data, repoPath, porcelainVersion);
            return status;
        });
    }
    getVersionedFile(repoPath, fileName, sha) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.Logger.log(`getVersionedFile('${repoPath}', '${fileName}', ${sha})`);
            const file = yield git_1.Git.getVersionedFile(repoPath, fileName, sha);
            if (file === undefined)
                return undefined;
            const cacheKey = this.getCacheEntryKey(file);
            const entry = new UriCacheEntry(new gitUri_1.GitUri(vscode_1.Uri.file(fileName), { sha, repoPath: repoPath, fileName }));
            this._uriCache.set(cacheKey, entry);
            return file;
        });
    }
    getVersionedFileText(repoPath, fileName, sha) {
        logger_1.Logger.log(`getVersionedFileText('${repoPath}', '${fileName}', ${sha})`);
        return git_1.Git.show(repoPath, fileName, sha);
    }
    hasGitUriForFile(editor) {
        if (editor === undefined || editor.document === undefined || editor.document.uri === undefined)
            return false;
        const cacheKey = this.getCacheEntryKey(editor.document.uri);
        return this._uriCache.has(cacheKey);
    }
    isEditorBlameable(editor) {
        return (editor.viewColumn !== undefined || this.isTrackable(editor.document.uri) || this.hasGitUriForFile(editor));
    }
    isFileUncommitted(uri) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.Logger.log(`isFileUncommitted('${uri.repoPath}', '${uri.fsPath}')`);
            const status = yield this.getStatusForFile(uri.repoPath, uri.fsPath);
            return !!status;
        });
    }
    isTrackable(uri) {
        return uri.scheme === constants_1.DocumentSchemes.File || uri.scheme === constants_1.DocumentSchemes.Git || uri.scheme === constants_1.DocumentSchemes.GitLensGit;
    }
    isTracked(uri) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isTrackable(uri))
                return false;
            logger_1.Logger.log(`isTracked('${uri.fsPath}', '${uri.repoPath}')`);
            const result = yield git_1.Git.ls_files(uri.repoPath === undefined ? '' : uri.repoPath, uri.fsPath);
            return !!result;
        });
    }
    openDiffTool(repoPath, uri, staged) {
        logger_1.Logger.log(`openDiffTool('${repoPath}', '${uri}', ${staged})`);
        return git_1.Git.difftool_fileDiff(repoPath, uri.fsPath, staged);
    }
    openDirectoryDiff(repoPath, sha1, sha2) {
        logger_1.Logger.log(`openDirectoryDiff('${repoPath}', ${sha1}, ${sha2})`);
        return git_1.Git.difftool_dirDiff(repoPath, sha1, sha2);
    }
    startWatchingFileSystem() {
        if (this._fsWatcherDisposable !== undefined)
            return;
        const debouncedFn = system_1.Functions.debounce((uri) => this._onDidChangeFileSystem.fire(uri), 2500);
        const fn = (uri) => {
            if (/\.git/.test(uri.fsPath))
                return;
            debouncedFn(uri);
        };
        const watcher = vscode_1.workspace.createFileSystemWatcher(`**`);
        this._fsWatcherDisposable = vscode_1.Disposable.from(watcher, watcher.onDidChange(fn), watcher.onDidCreate(fn), watcher.onDidDelete(fn));
    }
    stopWatchingFileSystem() {
        this._fsWatcherDisposable && this._fsWatcherDisposable.dispose();
        this._fsWatcherDisposable = undefined;
    }
    stashApply(repoPath, stashName, deleteAfter = false) {
        logger_1.Logger.log(`stashApply('${repoPath}', ${stashName}, ${deleteAfter})`);
        return git_1.Git.stash_apply(repoPath, stashName, deleteAfter);
    }
    stashDelete(repoPath, stashName) {
        logger_1.Logger.log(`stashDelete('${repoPath}', ${stashName}})`);
        return git_1.Git.stash_delete(repoPath, stashName);
    }
    stashSave(repoPath, message, uris) {
        logger_1.Logger.log(`stashSave('${repoPath}', ${message}, ${uris})`);
        if (uris === undefined)
            return git_1.Git.stash_save(repoPath, message);
        const pathspecs = uris.map(u => git_1.Git.splitPath(u.fsPath, repoPath)[0]);
        return git_1.Git.stash_push(repoPath, pathspecs, message);
    }
    static getGitPath(gitPath) {
        return git_1.Git.getGitPath(gitPath);
    }
    static getGitVersion() {
        return git_1.Git.gitInfo().version;
    }
    static getRepoPath(cwd) {
        return __awaiter(this, void 0, void 0, function* () {
            const repoPath = yield git_1.Git.getRepoPath(cwd);
            if (!repoPath)
                return '';
            return repoPath;
        });
    }
    static fromGitContentUri(uri) {
        if (uri.scheme !== constants_1.DocumentSchemes.GitLensGit)
            throw new Error(`fromGitUri(uri=${uri}) invalid scheme`);
        return GitService._fromGitContentUri(uri);
    }
    static _fromGitContentUri(uri) {
        return JSON.parse(uri.query);
    }
    static isSha(sha) {
        return git_1.Git.isSha(sha);
    }
    static isUncommitted(sha) {
        return git_1.Git.isUncommitted(sha);
    }
    static normalizePath(fileName, repoPath) {
        return git_1.Git.normalizePath(fileName, repoPath);
    }
    static shortenSha(sha) {
        if (sha === undefined)
            return undefined;
        return git_1.Git.shortenSha(sha);
    }
    static toGitContentUri(shaOrcommitOrUri, fileName, repoPath, originalFileName) {
        let data;
        let shortSha;
        if (typeof shaOrcommitOrUri === 'string') {
            data = GitService._toGitUriData({
                sha: shaOrcommitOrUri,
                fileName: fileName,
                repoPath: repoPath,
                originalFileName: originalFileName
            });
            shortSha = GitService.shortenSha(shaOrcommitOrUri);
        }
        else if (shaOrcommitOrUri instanceof git_1.GitCommit) {
            data = GitService._toGitUriData(shaOrcommitOrUri, undefined, shaOrcommitOrUri.originalFileName);
            fileName = shaOrcommitOrUri.fileName;
            shortSha = shaOrcommitOrUri.shortSha;
        }
        else {
            data = GitService._toGitUriData({
                sha: shaOrcommitOrUri.sha,
                fileName: shaOrcommitOrUri.fsPath,
                repoPath: shaOrcommitOrUri.repoPath
            });
            fileName = shaOrcommitOrUri.fsPath;
            shortSha = shaOrcommitOrUri.shortSha;
        }
        const extension = path.extname(fileName);
        return vscode_1.Uri.parse(`${constants_1.DocumentSchemes.GitLensGit}:${path.basename(fileName, extension)}:${shortSha}${extension}?${JSON.stringify(data)}`);
    }
    static toReferenceGitContentUri(commit, index, commitCount, originalFileName, decoration, dateFormat) {
        return GitService._toReferenceGitContentUri(commit, constants_1.DocumentSchemes.GitLensGit, commitCount, GitService._toGitUriData(commit, index, originalFileName, decoration), dateFormat);
    }
    static _toReferenceGitContentUri(commit, scheme, commitCount, data, dateFormat) {
        const pad = (n) => ('0000000' + n).slice(-('' + commitCount).length);
        const ext = path.extname(data.fileName);
        const uriPath = `${path.relative(commit.repoPath, data.fileName.slice(0, -ext.length))}/${commit.shortSha}${ext}`;
        let message = commit.message;
        if (message.length > 50) {
            message = message.substring(0, 49) + constants_1.GlyphChars.Ellipsis;
        }
        if (dateFormat === null) {
            dateFormat = 'MMMM Do, YYYY h:MMa';
        }
        return vscode_1.Uri.parse(`${scheme}:${pad(data.index || 0)} ${constants_1.GlyphChars.Dot} ${encodeURIComponent(message)} ${constants_1.GlyphChars.Dot} ${commit.formatDate(dateFormat)} ${constants_1.GlyphChars.Dot} ${encodeURIComponent(uriPath)}?${JSON.stringify(data)}`);
    }
    static _toGitUriData(commit, index, originalFileName, decoration) {
        const fileName = git_1.Git.normalizePath(path.resolve(commit.repoPath, commit.fileName));
        const data = { repoPath: commit.repoPath, fileName: fileName, sha: commit.sha, index: index };
        if (originalFileName) {
            data.originalFileName = git_1.Git.normalizePath(path.resolve(commit.repoPath, originalFileName));
        }
        if (decoration) {
            data.decoration = decoration;
        }
        return data;
    }
    static validateGitVersion(major, minor) {
        const [gitMajor, gitMinor] = this.getGitVersion().split('.');
        return (parseInt(gitMajor, 10) >= major && parseInt(gitMinor, 10) >= minor);
    }
}
GitService.fakeSha = 'ffffffffffffffffffffffffffffffffffffffff';
GitService.uncommittedSha = '0000000000000000000000000000000000000000';
GitService.EmptyPromise = Promise.resolve(undefined);
exports.GitService = GitService;
//# sourceMappingURL=gitService.js.map