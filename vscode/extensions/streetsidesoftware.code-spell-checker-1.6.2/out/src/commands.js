"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CSpellSettings = require("./settings/CSpellSettings");
const Settings = require("./settings");
const vscode_1 = require("vscode");
var settings_1 = require("./settings");
exports.toggleEnableSpellChecker = settings_1.toggleEnableSpellChecker;
exports.enableCurrentLanguage = settings_1.enableCurrentLanguage;
exports.disableCurrentLanguage = settings_1.disableCurrentLanguage;
function handlerApplyTextEdits(client) {
    return function applyTextEdits(uri, documentVersion, edits) {
        const textEditor = vscode_1.window.activeTextEditor;
        if (textEditor && textEditor.document.uri.toString() === uri) {
            if (textEditor.document.version !== documentVersion) {
                vscode_1.window.showInformationMessage(`Spelling changes are outdated and cannot be applied to the document.`);
            }
            textEditor.edit(mutator => {
                for (const edit of edits) {
                    mutator.replace(client.protocol2CodeConverter.asRange(edit.range), edit.newText);
                }
            }).then((success) => {
                if (!success) {
                    vscode_1.window.showErrorMessage('Failed to apply spelling changes to the document.');
                }
            });
        }
    };
}
exports.handlerApplyTextEdits = handlerApplyTextEdits;
function addWordToFolderDictionary(word, uri) {
    if (!uri || !Settings.hasWorkspaceLocation()) {
        return addWordToWorkspaceDictionary(word);
    }
    uri = pathToUri(uri);
    const target = Settings.createTargetForUri(Settings.Target.WorkspaceFolder, uri);
    return Settings.addWordToSettings(target, word)
        .then(_ => Settings.findExistingSettingsFileLocation())
        .then(path => path
        ? CSpellSettings.addWordToSettingsAndUpdate(path, word).then(_ => { })
        : undefined);
}
exports.addWordToFolderDictionary = addWordToFolderDictionary;
function addWordToWorkspaceDictionary(word, uri) {
    if (!Settings.hasWorkspaceLocation()) {
        return addWordToUserDictionary(word);
    }
    uri = typeof uri === 'string' ? pathToUri(uri) : uri;
    const target = uri ? Settings.createTargetForUri(Settings.Target.Workspace, uri) : Settings.Target.Workspace;
    return Settings.addWordToSettings(target, word)
        .then(_ => Settings.findExistingSettingsFileLocation())
        .then(path => path
        ? CSpellSettings.addWordToSettingsAndUpdate(path, word).then(_ => { })
        : undefined);
}
exports.addWordToWorkspaceDictionary = addWordToWorkspaceDictionary;
function addWordToUserDictionary(word) {
    return Settings.addWordToSettings(Settings.Target.Global, word);
}
exports.addWordToUserDictionary = addWordToUserDictionary;
function enableLanguageId(languageId, uri) {
    if (languageId) {
        return Settings.enableLanguage(Settings.Target.Global, languageId)
            .then(() => {
            // Add it from the workspace as well if necessary
            const allSettings = Settings.getEnabledLanguagesFromConfig(Settings.Scopes.Workspace);
            if (allSettings) {
                return Settings.enableLanguage(Settings.Target.Workspace, languageId);
            }
        });
    }
    return Promise.resolve();
}
exports.enableLanguageId = enableLanguageId;
function disableLanguageId(languageId, uri) {
    if (languageId) {
        return Settings.disableLanguage(Settings.Target.Global, languageId)
            .then(() => {
            // Remove it from the workspace as well if necessary
            const allSettings = Settings.getEnabledLanguagesFromConfig(Settings.Scopes.Workspace);
            if (allSettings) {
                return Settings.disableLanguage(Settings.Target.Workspace, languageId);
            }
        });
    }
    return Promise.resolve();
}
exports.disableLanguageId = disableLanguageId;
function userCommandAddWordToDictionary(prompt, fnAddWord) {
    return function () {
        const { activeTextEditor = {} } = vscode_1.window;
        const { selection, document } = activeTextEditor;
        const range = selection && document ? document.getWordRangeAtPosition(selection.active) : undefined;
        const value = range ? document.getText(selection) || document.getText(range) : selection && document.getText(selection) || '';
        return (selection && !selection.isEmpty)
            ? fnAddWord(value)
            : vscode_1.window.showInputBox({ prompt, value }).then(word => { word && fnAddWord(word); });
    };
}
exports.userCommandAddWordToDictionary = userCommandAddWordToDictionary;
function pathToUri(uri) {
    if (uri instanceof vscode_1.Uri) {
        return uri;
    }
    return vscode_1.Uri.parse(uri);
}
//# sourceMappingURL=commands.js.map