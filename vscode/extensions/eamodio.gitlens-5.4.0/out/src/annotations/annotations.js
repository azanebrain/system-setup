"use strict";
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
const commands_1 = require("../commands");
const configuration_1 = require("../configuration");
const constants_1 = require("../constants");
const gitService_1 = require("../gitService");
exports.endOfLineIndex = 1000000;
const escapeMarkdownRegEx = /[`\>\#\*\_\-\+\.]/g;
class Annotations {
    static applyHeatmap(decoration, date, now) {
        const color = this._getHeatmapColor(now, date);
        decoration.renderOptions.before.borderColor = color;
    }
    static _getHeatmapColor(now, date) {
        const days = system_1.Dates.dateDaysFromNow(date, now);
        if (days <= 2)
            return '#ffeca7';
        if (days <= 7)
            return '#ffdd8c';
        if (days <= 14)
            return '#ffdd7c';
        if (days <= 30)
            return '#fba447';
        if (days <= 60)
            return '#f68736';
        if (days <= 90)
            return '#f37636';
        if (days <= 180)
            return '#ca6632';
        if (days <= 365)
            return '#c0513f';
        if (days <= 730)
            return '#a2503a';
        return '#793738';
    }
    static getHoverMessage(commit, dateFormat, hasRemotes) {
        if (dateFormat === null) {
            dateFormat = 'MMMM Do, YYYY h:MMa';
        }
        let message = '';
        if (!commit.isUncommitted) {
            message = commit.message
                .replace(escapeMarkdownRegEx, '\\$&')
                .replace(/^===/gm, `${constants_1.GlyphChars.ZeroWidthSpace}===`)
                .replace(/\n/g, '  \n');
            message = `\n\n> ${message}`;
        }
        const openInRemoteCommand = hasRemotes
            ? `${'&nbsp;'.repeat(3)} [\`${constants_1.GlyphChars.ArrowUpRight}\`](${commands_1.OpenCommitInRemoteCommand.getMarkdownCommandArgs(commit.sha)} "Open in Remote")`
            : '';
        const markdown = new vscode_1.MarkdownString(`[\`${commit.shortSha}\`](${commands_1.ShowQuickCommitDetailsCommand.getMarkdownCommandArgs(commit.sha)} "Show Commit Details") &nbsp; __${commit.author}__, ${commit.fromNow()} &nbsp; _(${commit.formatDate(dateFormat)})_ ${openInRemoteCommand} &nbsp; ${message}`);
        markdown.isTrusted = true;
        return markdown;
    }
    static getHoverDiffMessage(commit, chunkLine) {
        if (chunkLine === undefined)
            return undefined;
        const codeDiff = this._getCodeDiff(chunkLine);
        const markdown = new vscode_1.MarkdownString(commit.isUncommitted
            ? `[\`Changes\`](${commands_1.DiffWithCommand.getMarkdownCommandArgs(commit)} "Open Changes") &nbsp; ${constants_1.GlyphChars.Dash} &nbsp; _uncommitted_\n${codeDiff}`
            : `[\`Changes\`](${commands_1.DiffWithCommand.getMarkdownCommandArgs(commit)} "Open Changes") &nbsp; ${constants_1.GlyphChars.Dash} &nbsp; [\`${commit.previousShortSha}\`](${commands_1.ShowQuickCommitDetailsCommand.getMarkdownCommandArgs(commit.previousSha)} "Show Commit Details") ${constants_1.GlyphChars.ArrowLeftRight} [\`${commit.shortSha}\`](${commands_1.ShowQuickCommitDetailsCommand.getMarkdownCommandArgs(commit.sha)} "Show Commit Details")\n${codeDiff}`);
        markdown.isTrusted = true;
        return markdown;
    }
    static _getCodeDiff(chunkLine) {
        const previous = chunkLine.previous === undefined ? undefined : chunkLine.previous[0];
        return `\`\`\`
-  ${previous === undefined || previous.line === undefined ? '' : previous.line.trim()}
+  ${chunkLine.line === undefined ? '' : chunkLine.line.trim()}
\`\`\``;
    }
    static changesHover(commit, line, uri, git) {
        return __awaiter(this, void 0, void 0, function* () {
            const chunkLine = yield git.getDiffForLine(uri, line + uri.offset, commit.isUncommitted ? undefined : commit.previousSha);
            const message = this.getHoverDiffMessage(commit, chunkLine);
            return {
                hoverMessage: message
            };
        });
    }
    static detailsHover(commit, dateFormat, hasRemotes) {
        const message = this.getHoverMessage(commit, dateFormat, hasRemotes);
        return {
            hoverMessage: message
        };
    }
    static gutter(commit, format, dateFormatOrFormatOptions, renderOptions) {
        const message = gitService_1.CommitFormatter.fromTemplate(format, commit, dateFormatOrFormatOptions);
        return {
            renderOptions: {
                before: Object.assign({}, renderOptions.before, {
                    contentText: system_1.Strings.pad(message.replace(/ /g, constants_1.GlyphChars.Space), 1, 1)
                }),
                dark: {
                    before: commit.isUncommitted
                        ? Object.assign({}, renderOptions.dark, { color: renderOptions.uncommittedForegroundColor.dark }) : Object.assign({}, renderOptions.dark)
                },
                light: {
                    before: commit.isUncommitted
                        ? Object.assign({}, renderOptions.light, { color: renderOptions.uncommittedForegroundColor.light }) : Object.assign({}, renderOptions.light)
                }
            }
        };
    }
    static gutterRenderOptions(cfgTheme, heatmap, options) {
        const cfgFileTheme = cfgTheme.annotations.file.gutter;
        let width = 4;
        for (const token of system_1.Objects.values(options.tokenOptions)) {
            if (token === undefined)
                continue;
            if (token.truncateTo == null) {
                width = 0;
                break;
            }
            width += token.truncateTo;
        }
        let borderStyle = undefined;
        let borderWidth = undefined;
        if (heatmap.enabled) {
            borderStyle = 'solid';
            borderWidth = heatmap.location === 'left' ? '0 0 0 2px' : '0 2px 0 0';
        }
        return {
            uncommittedForegroundColor: {
                dark: cfgFileTheme.dark.uncommittedForegroundColor || cfgFileTheme.dark.foregroundColor || configuration_1.themeDefaults.annotations.file.gutter.dark.foregroundColor,
                light: cfgFileTheme.light.uncommittedForegroundColor || cfgFileTheme.light.foregroundColor || configuration_1.themeDefaults.annotations.file.gutter.light.foregroundColor
            },
            before: {
                borderStyle: borderStyle,
                borderWidth: borderWidth,
                height: '100%',
                margin: '0 26px -1px 0',
                width: (width > 4) ? `${width}ch` : undefined
            },
            dark: {
                backgroundColor: cfgFileTheme.dark.backgroundColor || undefined,
                color: cfgFileTheme.dark.foregroundColor || configuration_1.themeDefaults.annotations.file.gutter.dark.foregroundColor,
                textDecoration: cfgFileTheme.separateLines ? 'overline solid rgba(0, 0, 0, .2)' : 'none'
            },
            light: {
                backgroundColor: cfgFileTheme.light.backgroundColor || undefined,
                color: cfgFileTheme.light.foregroundColor || configuration_1.themeDefaults.annotations.file.gutter.light.foregroundColor,
                textDecoration: cfgFileTheme.separateLines ? 'overline solid rgba(0, 0, 0, .05)' : 'none'
            }
        };
    }
    static hover(commit, renderOptions, now) {
        const decoration = {
            renderOptions: { before: Object.assign({}, renderOptions.before) }
        };
        this.applyHeatmap(decoration, commit.date, now);
        return decoration;
    }
    static hoverRenderOptions(cfgTheme, heatmap) {
        if (!heatmap.enabled)
            return { before: undefined };
        return {
            before: {
                borderStyle: 'solid',
                borderWidth: '0 0 0 2px',
                contentText: constants_1.GlyphChars.ZeroWidthSpace,
                height: '100%',
                margin: '0 26px 0 0',
                textDecoration: 'none'
            }
        };
    }
    static trailing(commit, format, dateFormat, cfgTheme) {
        const message = gitService_1.CommitFormatter.fromTemplate(format, commit, {
            truncateMessageAtNewLine: true,
            dateFormat: dateFormat
        });
        return {
            renderOptions: {
                after: {
                    contentText: system_1.Strings.pad(message.replace(/ /g, constants_1.GlyphChars.Space), 1, 1)
                },
                dark: {
                    after: {
                        backgroundColor: cfgTheme.annotations.line.trailing.dark.backgroundColor || undefined,
                        color: cfgTheme.annotations.line.trailing.dark.foregroundColor || configuration_1.themeDefaults.annotations.line.trailing.dark.foregroundColor
                    }
                },
                light: {
                    after: {
                        backgroundColor: cfgTheme.annotations.line.trailing.light.backgroundColor || undefined,
                        color: cfgTheme.annotations.line.trailing.light.foregroundColor || configuration_1.themeDefaults.annotations.line.trailing.light.foregroundColor
                    }
                }
            }
        };
    }
    static withRange(decoration, start, end) {
        let range = decoration.range;
        if (start !== undefined) {
            range = range.with({
                start: range.start.with({ character: start })
            });
        }
        if (end !== undefined) {
            range = range.with({
                end: range.end.with({ character: end })
            });
        }
        return Object.assign({}, decoration, { range: range });
    }
}
exports.Annotations = Annotations;
//# sourceMappingURL=annotations.js.map