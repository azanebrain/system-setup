'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const git_1 = require("./../git");
const moment = require("moment");
const path = require("path");
const diffRegex = /diff --git a\/(.*) b\/(.*)/;
class GitLogParser {
    static _parseEntries(data, type, maxCount, reverse) {
        if (!data)
            return undefined;
        const lines = data.split('\n');
        if (!lines.length)
            return undefined;
        const entries = [];
        let entry;
        let position = -1;
        while (++position < lines.length) {
            if (reverse && maxCount && (entries.length >= maxCount))
                break;
            let lineParts = lines[position].split(' ');
            if (lineParts.length < 2) {
                continue;
            }
            if (!entry) {
                if (!git_1.Git.shaRegex.test(lineParts[0]))
                    continue;
                entry = {
                    sha: lineParts[0]
                };
                continue;
            }
            switch (lineParts[0]) {
                case 'author':
                    entry.author = git_1.Git.isUncommitted(entry.sha)
                        ? 'Uncommitted'
                        : lineParts.slice(1).join(' ').trim();
                    break;
                case 'author-date':
                    entry.authorDate = `${lineParts[1]}T${lineParts[2]}${lineParts[3]}`;
                    break;
                case 'parents':
                    entry.parentShas = lineParts.slice(1);
                    break;
                case 'summary':
                    entry.summary = lineParts.slice(1).join(' ').trim();
                    while (++position < lines.length) {
                        const next = lines[position];
                        if (!next)
                            break;
                        if (next === 'filename ?') {
                            position--;
                            break;
                        }
                        entry.summary += `\n${lines[position]}`;
                    }
                    break;
                case 'filename':
                    if (type === 'branch') {
                        const nextLine = lines[position + 1];
                        if (nextLine && git_1.Git.shaRegex.test(nextLine))
                            continue;
                        position++;
                        let diff = false;
                        while (++position < lines.length) {
                            const line = lines[position];
                            lineParts = line.split(' ');
                            if (git_1.Git.shaRegex.test(lineParts[0])) {
                                position--;
                                break;
                            }
                            if (diff)
                                continue;
                            if (lineParts[0] === 'diff') {
                                diff = true;
                                const matches = diffRegex.exec(line);
                                entry.fileName = matches[1];
                                const originalFileName = matches[2];
                                if (entry.fileName !== originalFileName) {
                                    entry.originalFileName = originalFileName;
                                }
                                continue;
                            }
                            if (entry.fileStatuses == null) {
                                entry.fileStatuses = [];
                            }
                            const status = {
                                status: line[0],
                                fileName: line.substring(1),
                                originalFileName: undefined
                            };
                            this._parseFileName(status);
                            entry.fileStatuses.push(status);
                        }
                        if (entry.fileStatuses) {
                            entry.fileName = entry.fileStatuses.filter(_ => !!_.fileName).map(_ => _.fileName).join(', ');
                        }
                    }
                    else {
                        position += 2;
                        const line = lines[position];
                        entry.status = line[0];
                        entry.fileName = line.substring(1);
                        this._parseFileName(entry);
                    }
                    entries.push(entry);
                    entry = undefined;
                    break;
                default:
                    break;
            }
        }
        return entries;
    }
    static parse(data, type, repoPath, fileName, sha, maxCount, reverse, range) {
        const entries = this._parseEntries(data, type, maxCount, reverse);
        if (!entries)
            return undefined;
        const authors = new Map();
        const commits = new Map();
        let relativeFileName;
        let recentCommit;
        if (repoPath !== undefined) {
            repoPath = git_1.Git.normalizePath(repoPath);
        }
        for (let i = 0, len = entries.length; i < len; i++) {
            if (reverse && maxCount && (i >= maxCount))
                break;
            const entry = entries[i];
            if (i === 0 && type === 'file' && !repoPath) {
                repoPath = git_1.Git.normalizePath(fileName.replace(fileName.startsWith('/') ? `/${entry.fileName}` : entry.fileName, ''));
                relativeFileName = git_1.Git.normalizePath(path.relative(repoPath, fileName));
            }
            else {
                relativeFileName = entry.fileName;
            }
            let commit = commits.get(entry.sha);
            if (!commit) {
                let author = authors.get(entry.author);
                if (!author) {
                    author = {
                        name: entry.author,
                        lineCount: 0
                    };
                    authors.set(entry.author, author);
                }
                commit = new git_1.GitLogCommit(type, repoPath, entry.sha, relativeFileName, entry.author, moment(entry.authorDate).toDate(), entry.summary, entry.status, entry.fileStatuses, undefined, entry.originalFileName);
                commit.parentShas = entry.parentShas;
                if (relativeFileName !== entry.fileName) {
                    commit.originalFileName = entry.fileName;
                }
                commits.set(entry.sha, commit);
            }
            if (recentCommit) {
                recentCommit.previousSha = commit.sha;
                commit.nextSha = commit.sha !== recentCommit.sha ? recentCommit.sha : recentCommit.nextSha;
                if (type === 'file') {
                    recentCommit.previousFileName = commit.originalFileName || commit.fileName;
                    commit.nextFileName = recentCommit.originalFileName || recentCommit.fileName;
                }
            }
            recentCommit = commit;
        }
        commits.forEach(c => authors.get(c.author).lineCount += c.lines.length);
        const sortedAuthors = new Map();
        Array.from(authors.values())
            .sort((a, b) => b.lineCount - a.lineCount)
            .forEach(a => sortedAuthors.set(a.name, a));
        return {
            repoPath: repoPath,
            authors: sortedAuthors,
            commits: commits,
            sha: sha,
            maxCount: maxCount,
            range: range,
            truncated: !!(maxCount && entries.length >= maxCount)
        };
    }
    static _parseFileName(entry) {
        const index = entry.fileName.indexOf('\t') + 1;
        if (index) {
            const next = entry.fileName.indexOf('\t', index) + 1;
            if (next) {
                entry.originalFileName = entry.fileName.substring(index, next - 1);
                entry.fileName = entry.fileName.substring(next);
            }
            else {
                entry.fileName = entry.fileName.substring(index);
            }
        }
    }
}
exports.GitLogParser = GitLogParser;
//# sourceMappingURL=logParser.js.map