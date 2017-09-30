"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ImportGroupIdentifierInvalidError_1 = require("./ImportGroupIdentifierInvalidError");
const ImportGroupKeyword_1 = require("./ImportGroupKeyword");
const KeywordImportGroup_1 = require("./KeywordImportGroup");
const RegexImportGroup_1 = require("./RegexImportGroup");
const RemainImportGroup_1 = require("./RemainImportGroup");
class ImportGroupSettingParser {
    static get default() {
        return [
            new KeywordImportGroup_1.KeywordImportGroup(ImportGroupKeyword_1.ImportGroupKeyword.Plains),
            new KeywordImportGroup_1.KeywordImportGroup(ImportGroupKeyword_1.ImportGroupKeyword.Modules),
            new KeywordImportGroup_1.KeywordImportGroup(ImportGroupKeyword_1.ImportGroupKeyword.Workspace),
            new RemainImportGroup_1.RemainImportGroup(),
        ];
    }
    static parseSetting(setting) {
        let identifier;
        let order = 'asc';
        if (typeof setting === 'string') {
            identifier = setting;
        }
        else {
            identifier = setting.identifier;
            order = setting.order;
        }
        if (/^\/.+.*\/$/g.test(identifier)) {
            return new RegexImportGroup_1.RegexImportGroup(identifier, order);
        }
        if (ImportGroupKeyword_1.ImportGroupKeyword[identifier] === ImportGroupKeyword_1.ImportGroupKeyword.Remaining) {
            return new RemainImportGroup_1.RemainImportGroup(order);
        }
        if (ImportGroupKeyword_1.ImportGroupKeyword[identifier] !== undefined) {
            return new KeywordImportGroup_1.KeywordImportGroup(ImportGroupKeyword_1.ImportGroupKeyword[identifier], order);
        }
        throw new ImportGroupIdentifierInvalidError_1.ImportGroupIdentifierInvalidError(identifier);
    }
}
exports.ImportGroupSettingParser = ImportGroupSettingParser;
