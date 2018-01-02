"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs-extra");
const tsmerge_1 = require("tsmerge");
const json = require("comment-json");
const path = require("path");
const util_1 = require("../util");
const currentSettingsFileVersion = '0.1';
exports.sectionCSpell = 'cSpell';
exports.defaultFileName = 'cSpell.json';
// cSpell:ignore hte
const defaultSettings = {
    '//^': [
        '// cSpell Settings'
    ],
    '// version': [`
    // Version of the setting file.  Always 0.1`
    ],
    version: currentSettingsFileVersion,
    '// language': [`
    // language - current active spelling language`],
    language: 'en',
    '// words': [`
    // words - list of words to be always considered correct`
    ],
    words: [],
    '// flagWords': [`
    // flagWords - list of words to be always considered incorrect
    // This is useful for offensive words and common spelling errors.
    // For example "hte" should be "the"`
    ],
    flagWords: [],
};
function getDefaultSettings() {
    return defaultSettings;
}
exports.getDefaultSettings = getDefaultSettings;
function readSettings(filename) {
    return fs.readFile(filename)
        .then(buffer => buffer.toString(), () => json.stringify(defaultSettings, null, 4))
        .then(json.parse)
        .then(a => a, error => defaultSettings)
        .then(settings => tsmerge_1.merge(defaultSettings, settings));
}
exports.readSettings = readSettings;
function updateSettings(filename, settings) {
    return fs.mkdirp(path.dirname(filename))
        .then(() => fs.writeFile(filename, json.stringify(settings, null, 4)))
        .then(() => settings);
}
exports.updateSettings = updateSettings;
function addWordToSettingsAndUpdate(filename, word) {
    return readSettings(filename)
        .then(settings => addWordsToSettings(settings, word.split(' ')))
        .then(settings => updateSettings(filename, settings));
}
exports.addWordToSettingsAndUpdate = addWordToSettingsAndUpdate;
function addWordsToSettings(settings, wordsToAdd) {
    const words = (settings.words || [])
        .concat(wordsToAdd)
        .map(a => a.trim())
        .filter(a => !!a)
        .filter(util_1.uniqueFilter())
        .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    return Object.assign({}, settings, { words });
}
exports.addWordsToSettings = addWordsToSettings;
function addLanguageIdsToSettings(settings, languageIds, onlyIfExits) {
    if (settings.enabledLanguageIds || !onlyIfExits) {
        const enabledLanguageIds = util_1.unique((settings.enabledLanguageIds || []).concat(languageIds));
        return Object.assign({}, settings, { enabledLanguageIds });
    }
    return settings;
}
exports.addLanguageIdsToSettings = addLanguageIdsToSettings;
function removeLanguageIdsFromSettings(settings, languageIds) {
    if (settings.enabledLanguageIds) {
        const excludeLangIds = new Set(languageIds);
        const enabledLanguageIds = settings.enabledLanguageIds.filter(a => !excludeLangIds.has(a));
        const newSettings = Object.assign({}, settings, { enabledLanguageIds });
        if (!newSettings.enabledLanguageIds.length) {
            delete newSettings.enabledLanguageIds;
        }
        return newSettings;
    }
    return settings;
}
exports.removeLanguageIdsFromSettings = removeLanguageIdsFromSettings;
function writeAddLanguageIdsToSettings(filename, languageIds, onlyIfExits) {
    return readSettings(filename)
        .then(settings => addLanguageIdsToSettings(settings, languageIds, onlyIfExits))
        .then(settings => updateSettings(filename, settings));
}
exports.writeAddLanguageIdsToSettings = writeAddLanguageIdsToSettings;
function removeLanguageIdsFromSettingsAndUpdate(filename, languageIds) {
    return readSettings(filename)
        .then(settings => removeLanguageIdsFromSettings(settings, languageIds))
        .then(settings => updateSettings(filename, settings));
}
exports.removeLanguageIdsFromSettingsAndUpdate = removeLanguageIdsFromSettingsAndUpdate;
//# sourceMappingURL=CSpellSettings.js.map