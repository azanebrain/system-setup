'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
exports.ExtensionId = 'gitlens';
exports.ExtensionKey = exports.ExtensionId;
exports.ExtensionOutputChannelName = 'GitLens';
exports.QualifiedExtensionId = `eamodio.${exports.ExtensionId}`;
exports.ApplicationInsightsKey = 'a9c302f8-6483-4d01-b92c-c159c799c679';
exports.BuiltInCommands = {
    CloseActiveEditor: 'workbench.action.closeActiveEditor',
    CloseAllEditors: 'workbench.action.closeAllEditors',
    CursorMove: 'cursorMove',
    Diff: 'vscode.diff',
    EditorScroll: 'editorScroll',
    ExecuteDocumentSymbolProvider: 'vscode.executeDocumentSymbolProvider',
    ExecuteCodeLensProvider: 'vscode.executeCodeLensProvider',
    Open: 'vscode.open',
    NextEditor: 'workbench.action.nextEditor',
    PreviewHtml: 'vscode.previewHtml',
    RevealLine: 'revealLine',
    SetContext: 'setContext',
    ShowReferences: 'editor.action.showReferences',
    ToggleRenderWhitespace: 'editor.action.toggleRenderWhitespace'
};
exports.CommandContext = {
    AnnotationStatus: 'gitlens:annotationStatus',
    CanToggleCodeLens: 'gitlens:canToggleCodeLens',
    Enabled: 'gitlens:enabled',
    GitExplorerView: 'gitlens:gitExplorer:view',
    HasRemotes: 'gitlens:hasRemotes',
    IsBlameable: 'gitlens:isBlameable',
    IsRepository: 'gitlens:isRepository',
    IsTracked: 'gitlens:isTracked',
    Key: 'gitlens:key'
};
function setCommandContext(key, value) {
    return vscode_1.commands.executeCommand(exports.BuiltInCommands.SetContext, key, value);
}
exports.setCommandContext = setCommandContext;
exports.DocumentSchemes = {
    File: 'file',
    Git: 'git',
    GitLensGit: 'gitlens-git'
};
exports.GlyphChars = {
    ArrowBack: '\u21a9',
    ArrowDown: '\u2193',
    ArrowDropRight: '\u2937',
    ArrowLeft: '\u2190',
    ArrowLeftRight: '\u2194',
    ArrowRight: '\u2192',
    ArrowRightHollow: '\u21e8',
    ArrowUp: '\u2191',
    ArrowUpRight: '\u2197',
    Asterisk: '\u2217',
    Check: '\u2713',
    Dash: '\u2014',
    Dot: '\u2022',
    Ellipsis: '\u2026',
    Pensil: '\u270E',
    Space: '\u00a0',
    ZeroWidthSpace: '\u200b'
};
exports.GlobalState = {
    GitLensVersion: 'gitlensVersion'
};
exports.WorkspaceState = {
    GitExplorerView: 'gitlens:gitExplorer:view'
};
//# sourceMappingURL=constants.js.map