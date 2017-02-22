'use strict';
const git_1 = require("./../git");
const moment = require("moment");
const path = require("path");
class GitBlameParserEnricher {
    constructor(format) {
        this.format = format;
        if (format !== git_1.GitBlameFormat.incremental) {
            throw new Error(`Invalid blame format=${format}`);
        }
    }
    _parseEntries(data) {
        if (!data)
            return undefined;
        const lines = data.split('\n');
        if (!lines.length)
            return undefined;
        const entries = [];
        let entry;
        let position = -1;
        while (++position < lines.length) {
            let lineParts = lines[position].split(' ');
            if (lineParts.length < 2) {
                continue;
            }
            if (!entry) {
                entry = {
                    sha: lineParts[0].substring(0, 8),
                    originalLine: parseInt(lineParts[1], 10) - 1,
                    line: parseInt(lineParts[2], 10) - 1,
                    lineCount: parseInt(lineParts[3], 10)
                };
                continue;
            }
            switch (lineParts[0]) {
                case 'author':
                    entry.author = lineParts.slice(1).join(' ').trim();
                    break;
                case 'author-time':
                    entry.authorDate = lineParts[1];
                    break;
                case 'author-tz':
                    entry.authorTimeZone = lineParts[1];
                    break;
                case 'summary':
                    entry.summary = lineParts.slice(1).join(' ').trim();
                    break;
                case 'previous':
                    entry.previousSha = lineParts[1].substring(0, 8);
                    entry.previousFileName = lineParts.slice(2).join(' ');
                    break;
                case 'filename':
                    entry.fileName = lineParts.slice(1).join(' ');
                    entries.push(entry);
                    entry = undefined;
                    break;
                default:
                    break;
            }
        }
        return entries;
    }
    enrich(data, fileName) {
        const entries = this._parseEntries(data);
        if (!entries)
            return undefined;
        const authors = new Map();
        const commits = new Map();
        const lines = [];
        let repoPath;
        let relativeFileName;
        for (let i = 0, len = entries.length; i < len; i++) {
            const entry = entries[i];
            if (i === 0) {
                repoPath = fileName.replace(`/${entry.fileName}`, '');
                relativeFileName = path.relative(repoPath, fileName).replace(/\\/g, '/');
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
                commit = new git_1.GitCommit(repoPath, entry.sha, relativeFileName, entry.author, moment(`${entry.authorDate} ${entry.authorTimeZone}`, 'X +-HHmm').toDate(), entry.summary);
                if (relativeFileName !== entry.fileName) {
                    commit.originalFileName = entry.fileName;
                }
                if (entry.previousSha) {
                    commit.previousSha = entry.previousSha;
                    commit.previousFileName = entry.previousFileName;
                }
                commits.set(entry.sha, commit);
            }
            for (let j = 0, len = entry.lineCount; j < len; j++) {
                const line = {
                    sha: entry.sha,
                    line: entry.line + j,
                    originalLine: entry.originalLine + j
                };
                if (commit.previousSha) {
                    line.previousSha = commit.previousSha;
                }
                commit.lines.push(line);
                lines[line.line] = line;
            }
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
            lines: lines
        };
    }
}
exports.GitBlameParserEnricher = GitBlameParserEnricher;
//# sourceMappingURL=blameParserEnricher.js.map