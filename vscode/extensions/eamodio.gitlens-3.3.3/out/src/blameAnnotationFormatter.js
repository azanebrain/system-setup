'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
exports.defaultAbsoluteDateLength = 10;
exports.defaultRelativeDateLength = 13;
exports.defaultAuthorLength = 16;
exports.defaultMessageLength = 32;
var BlameAnnotationFormat;
(function (BlameAnnotationFormat) {
    BlameAnnotationFormat[BlameAnnotationFormat["Constrained"] = 0] = "Constrained";
    BlameAnnotationFormat[BlameAnnotationFormat["Unconstrained"] = 1] = "Unconstrained";
})(BlameAnnotationFormat = exports.BlameAnnotationFormat || (exports.BlameAnnotationFormat = {}));
class BlameAnnotationFormatter {
    static getAnnotation(config, commit, format) {
        const sha = commit.shortSha;
        let message = this.getMessage(config, commit, format === BlameAnnotationFormat.Unconstrained ? 0 : exports.defaultMessageLength);
        if (format === BlameAnnotationFormat.Unconstrained) {
            const authorAndDate = this.getAuthorAndDate(config, commit, config.annotation.dateFormat || 'MMMM Do, YYYY h:MMa');
            if (config.annotation.sha) {
                message = `${sha}${(authorAndDate ? `\u00a0\u2022\u00a0${authorAndDate}` : '')}${(message ? `\u00a0\u2022\u00a0${message}` : '')}`;
            }
            else if (config.annotation.author || config.annotation.date) {
                message = `${authorAndDate}${(message ? `\u00a0\u2022\u00a0${message}` : '')}`;
            }
            return message;
        }
        const author = this.getAuthor(config, commit, exports.defaultAuthorLength);
        const date = this.getDate(config, commit, config.annotation.dateFormat || 'MM/DD/YYYY', true);
        if (config.annotation.sha) {
            message = `${sha}${(author ? `\u00a0\u2022\u00a0${author}` : '')}${(date ? `\u00a0\u2022\u00a0${date}` : '')}${(message ? `\u00a0\u2022\u00a0${message}` : '')}`;
        }
        else if (config.annotation.author) {
            message = `${author}${(date ? `\u00a0\u2022\u00a0${date}` : '')}${(message ? `\u00a0\u2022\u00a0${message}` : '')}`;
        }
        else if (config.annotation.date) {
            message = `${date}${(message ? `\u00a0\u2022\u00a0${message}` : '')}`;
        }
        return message;
    }
    static getAnnotationHover(config, line, commit) {
        const message = `> \`${commit.message.replace(/\n/g, '\`\n>\n> \`')}\``;
        if (commit.isUncommitted) {
            return `\`${'0'.repeat(8)}\` &nbsp; __Uncommitted changes__`;
        }
        return `\`${commit.shortSha}\` &nbsp; __${commit.author}__, ${moment(commit.date).fromNow()} _(${moment(commit.date).format(config.annotation.dateFormat || 'MMMM Do, YYYY h:MMa')})_ \n\n${message}`;
    }
    static getAuthorAndDate(config, commit, format, force = false) {
        if (!force && !config.annotation.author && (!config.annotation.date || config.annotation.date === 'off'))
            return '';
        if (!config.annotation.author) {
            return this.getDate(config, commit, format);
        }
        if (!config.annotation.date || config.annotation.date === 'off') {
            return this.getAuthor(config, commit);
        }
        return `${this.getAuthor(config, commit)}, ${this.getDate(config, commit, format)}`;
    }
    static getAuthor(config, commit, truncateTo = 0, force = false) {
        if (!force && !config.annotation.author)
            return '';
        const author = commit.isUncommitted ? 'Uncommitted' : commit.author;
        if (!truncateTo)
            return author;
        if (author.length > truncateTo) {
            return `${author.substring(0, truncateTo - 1)}\u2026`;
        }
        if (force)
            return author;
        return author + '\u00a0'.repeat(truncateTo - author.length);
    }
    static getDate(config, commit, format, truncate = false, force = false) {
        if (!force && (!config.annotation.date || config.annotation.date === 'off'))
            return '';
        const date = config.annotation.date === 'relative'
            ? moment(commit.date).fromNow()
            : moment(commit.date).format(format);
        if (!truncate)
            return date;
        const truncateTo = config.annotation.date === 'relative' ? exports.defaultRelativeDateLength : exports.defaultAbsoluteDateLength;
        if (date.length > truncateTo) {
            return `${date.substring(0, truncateTo - 1)}\u2026`;
        }
        if (force)
            return date;
        return date + '\u00a0'.repeat(truncateTo - date.length);
    }
    static getMessage(config, commit, truncateTo = 0, force = false) {
        if (!force && !config.annotation.message)
            return '';
        let message = commit.isUncommitted ? 'Uncommitted change' : commit.message;
        if (truncateTo && message.length > truncateTo) {
            return `${message.substring(0, truncateTo - 1)}\u2026`;
        }
        return message;
    }
}
exports.BlameAnnotationFormatter = BlameAnnotationFormatter;
//# sourceMappingURL=blameAnnotationFormatter.js.map