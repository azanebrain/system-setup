"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typescript_parser_1 = require("typescript-parser");
const utilityFunctions_1 = require("../utilities/utilityFunctions");
class RegexImportGroup {
    constructor(regex, order = 'asc') {
        this.regex = regex;
        this.order = order;
        this.imports = [];
    }
    get sortedImports() {
        const sorted = this.imports.sort((i1, i2) => utilityFunctions_1.importSort(i1, i2, this.order));
        return [
            ...sorted.filter(i => i instanceof typescript_parser_1.StringImport),
            ...sorted.filter(i => !(i instanceof typescript_parser_1.StringImport)),
        ];
    }
    reset() {
        this.imports.length = 0;
    }
    processImport(tsImport) {
        let regexString = this.regex;
        regexString = regexString.startsWith('/') ? regexString.substring(1) : regexString;
        regexString = regexString.endsWith('/') ? regexString.substring(0, regexString.length - 1) : regexString;
        const regex = new RegExp(regexString, 'g');
        if (regex.test(tsImport.libraryName)) {
            this.imports.push(tsImport);
            return true;
        }
        return false;
    }
}
exports.RegexImportGroup = RegexImportGroup;
