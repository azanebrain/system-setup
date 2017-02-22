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
const gitLocator_1 = require("./gitLocator");
const logger_1 = require("../logger");
const spawn_rx_1 = require("spawn-rx");
const fs = require("fs");
const path = require("path");
const tmp = require("tmp");
__export(require("./gitEnrichment"));
__export(require("./enrichers/blameParserEnricher"));
__export(require("./enrichers/logParserEnricher"));
let git;
const UncommittedRegex = /^[0]+$/;
const DefaultLogParams = [`log`, `--name-only`, `--no-merges`, `--date=iso8601-strict`, `--format=%H -%nauthor %an%nauthor-date %ai%ncommitter %cn%ncommitter-date %ci%nsummary %s%nfilename ?`];
function gitCommand(cwd, ...args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const s = yield spawn_rx_1.spawnPromise(git.path, args, { cwd: cwd });
            logger_1.Logger.log('git', ...args, `  cwd='${cwd}'`);
            return s;
        }
        catch (ex) {
            const msg = ex && ex.toString();
            if (msg && (msg.includes('Not a git repository') || msg.includes('is outside repository') || msg.includes('no such path'))) {
                logger_1.Logger.warn('git', ...args, `  cwd='${cwd}'`, msg && `\n  ${msg.replace(/\r?\n|\r/g, ' ')}`);
            }
            else {
                logger_1.Logger.error('git', ...args, `  cwd='${cwd}'`, msg && `\n  ${msg.replace(/\r?\n|\r/g, ' ')}`);
            }
            throw ex;
        }
    });
}
exports.GitBlameFormat = {
    incremental: '--incremental',
    linePorcelain: '--line-porcelain',
    porcelain: '--porcelain'
};
class Git {
    static normalizePath(fileName, repoPath) {
        return fileName.replace(/\\/g, '/');
    }
    static splitPath(fileName, repoPath) {
        if (repoPath)
            return [fileName.replace(`${repoPath}/`, ''), repoPath];
        return [path.basename(fileName).replace(/\\/g, '/'), path.dirname(fileName).replace(/\\/g, '/')];
    }
    static repoPath(cwd, gitPath) {
        return __awaiter(this, void 0, void 0, function* () {
            git = yield gitLocator_1.findGitPath(gitPath);
            logger_1.Logger.log(`Git found: ${git.version} @ ${git.path === 'git' ? 'PATH' : git.path}`);
            let data = yield gitCommand(cwd, 'rev-parse', '--show-toplevel');
            data = data.replace(/\r?\n|\r/g, '').replace(/\\/g, '/');
            return data;
        });
    }
    static blame(format, fileName, sha, repoPath) {
        const [file, root] = Git.splitPath(Git.normalizePath(fileName), repoPath);
        const params = [`blame`, `--root`, format];
        if (sha) {
            params.push(`${sha}^!`);
        }
        return gitCommand(root, ...params, `--`, file);
    }
    static blameLines(format, fileName, startLine, endLine, sha, repoPath) {
        const [file, root] = Git.splitPath(Git.normalizePath(fileName), repoPath);
        const params = [`blame`, `--root`, format, `-L ${startLine},${endLine}`];
        if (sha) {
            params.push(`${sha}^!`);
        }
        return gitCommand(root, ...params, `--`, file);
    }
    static log(fileName, sha, repoPath, maxCount) {
        const [file, root] = Git.splitPath(Git.normalizePath(fileName), repoPath);
        const params = [...DefaultLogParams, `--follow`];
        if (maxCount) {
            params.push(`-n${maxCount}`);
        }
        if (sha) {
            params.push(`origin..${sha}`);
            params.push(`--`);
        }
        return gitCommand(root, ...params, file);
    }
    static logRange(fileName, start, end, sha, repoPath, maxCount) {
        const [file, root] = Git.splitPath(Git.normalizePath(fileName), repoPath);
        const params = [...DefaultLogParams];
        if (maxCount) {
            params.push(`-n${maxCount}`);
        }
        if (sha) {
            params.push(`--follow`);
            params.push(`origin..${sha}`);
        }
        params.push(`-L ${start},${end}:${file}`);
        return gitCommand(root, ...params);
    }
    static logRepo(repoPath, maxCount) {
        const params = [...DefaultLogParams];
        if (maxCount) {
            params.push(`-n${maxCount}`);
        }
        return gitCommand(repoPath, ...params);
    }
    static getVersionedFile(fileName, repoPath, sha) {
        return new Promise((resolve, reject) => {
            Git.getVersionedFileText(fileName, repoPath, sha).then(data => {
                const ext = path.extname(fileName);
                tmp.file({ prefix: `${path.basename(fileName, ext)}-${sha}__`, postfix: ext }, (err, destination, fd, cleanupCallback) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    logger_1.Logger.log(`getVersionedFile(${fileName}, ${repoPath}, ${sha}); destination=${destination}`);
                    fs.appendFile(destination, data, err => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve(destination);
                    });
                });
            });
        });
    }
    static getVersionedFileText(fileName, repoPath, sha) {
        const [file, root] = Git.splitPath(Git.normalizePath(fileName), repoPath);
        sha = sha.replace('^', '');
        if (Git.isUncommitted(sha))
            return Promise.reject(new Error(`sha=${sha} is uncommitted`));
        return gitCommand(root, 'show', `${sha}:./${file}`);
    }
    static isUncommitted(sha) {
        return UncommittedRegex.test(sha);
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Git;
//# sourceMappingURL=git.js.map