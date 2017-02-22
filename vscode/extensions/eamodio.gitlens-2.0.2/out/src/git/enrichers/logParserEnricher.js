'use strict';
const git_1 = require("./../git");
const moment = require("moment");
const path = require("path");
class GitLogParserEnricher {
    _parseEntries(data, isRepoPath) {
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
                if (!/^[a-f0-9]{40}$/.test(lineParts[0]))
                    continue;
                entry = {
                    sha: lineParts[0].substring(0, 8)
                };
                continue;
            }
            switch (lineParts[0]) {
                case 'author':
                    entry.author = lineParts.slice(1).join(' ').trim();
                    break;
                case 'author-date':
                    entry.authorDate = `${lineParts[1]}T${lineParts[2]}${lineParts[3]}`;
                    break;
                case 'summary':
                    entry.summary = lineParts.slice(1).join(' ').trim();
                    break;
                case 'filename':
                    if (isRepoPath) {
                        position++;
                        while (++position < lines.length) {
                            lineParts = lines[position].split(' ');
                            if (/^[a-f0-9]{40}$/.test(lineParts[0])) {
                                position--;
                                break;
                            }
                            if (entry.fileNames == null) {
                                entry.fileNames = [lineParts[0]];
                            }
                            else {
                                entry.fileNames.push(lineParts[0]);
                            }
                        }
                        entry.fileName = entry.fileNames.join(', ');
                    }
                    else {
                        position += 2;
                        lineParts = lines[position].split(' ');
                        if (lineParts.length === 1) {
                            entry.fileName = lineParts[0];
                        }
                        else {
                            entry.fileName = lineParts[3].substring(2);
                            position += 4;
                        }
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
    enrich(data, fileNameOrRepoPath, isRepoPath = false) {
        const entries = this._parseEntries(data, isRepoPath);
        if (!entries)
            return undefined;
        const authors = new Map();
        const commits = new Map();
        let repoPath;
        let relativeFileName;
        let recentCommit;
        if (isRepoPath) {
            repoPath = fileNameOrRepoPath;
        }
        for (let i = 0, len = entries.length; i < len; i++) {
            const entry = entries[i];
            if (i === 0 || isRepoPath) {
                if (isRepoPath) {
                    relativeFileName = entry.fileName;
                }
                else {
                    repoPath = fileNameOrRepoPath.replace(`/${entry.fileName}`, '');
                    relativeFileName = path.relative(repoPath, fileNameOrRepoPath).replace(/\\/g, '/');
                }
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
                commit = new git_1.GitCommit(repoPath, entry.sha, relativeFileName, entry.author, moment(entry.authorDate).toDate(), entry.summary);
                if (relativeFileName !== entry.fileName) {
                    commit.originalFileName = entry.fileName;
                }
                commits.set(entry.sha, commit);
            }
            if (recentCommit) {
                recentCommit.previousSha = commit.sha;
                if (!isRepoPath) {
                    recentCommit.previousFileName = commit.originalFileName || commit.fileName;
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
            commits: commits
        };
    }
}
exports.GitLogParserEnricher = GitLogParserEnricher;
//# sourceMappingURL=logParserEnricher.js.map