"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const StringTemplate_1 = require("../../utilities/StringTemplate");
const symbolSpecifier_1 = require("./symbolSpecifier");
const importTemplate = StringTemplate_1.stringTemplate `import ${0} from ${1}`;
const multiLineImport = StringTemplate_1.stringTemplate `import ${3}{
${0}${1}
} from ${2}`;
/**
 * Sort function for symbol specifiers. Does sort after the specifiers name (to lowercase).
 *
 * @param {SymbolSpecifier} i1
 * @param {SymbolSpecifier} i2
 * @returns {number}
 */
function specifierSort(i1, i2) {
    const strA = i1.specifier.toLowerCase();
    const strB = i2.specifier.toLowerCase();
    if (strA < strB) {
        return -1;
    }
    else if (strA > strB) {
        return 1;
    }
    return 0;
}
/**
 * Generates typescript code for a named import.
 *
 * @export
 * @param {NamedImport} imp
 * @param {TypescriptGenerationOptions} { stringQuoteStyle, eol }
 * @returns {string}
 */
function generateNamedImport(imp, { eol, stringQuoteStyle, spaceBraces, tabSize, multiLineWrapThreshold, multiLineTrailingComma, }) {
    const space = spaceBraces ? ' ' : '';
    const lib = `${stringQuoteStyle}${imp.libraryName}${stringQuoteStyle}${eol}`;
    const specifiers = imp.specifiers.sort(specifierSort).map(o => symbolSpecifier_1.generateSymbolSpecifier(o)).join(', ');
    let importSpecifiers = `${space}${specifiers}${space}`;
    if (importSpecifiers.trim().length === 0) {
        importSpecifiers = ' ';
    }
    const importString = importTemplate(getImportSpecifiers(imp, spaceBraces), lib);
    if (importString.length > multiLineWrapThreshold) {
        const spacings = Array(tabSize + 1).join(' ');
        return multiLineImport(imp.specifiers.sort(specifierSort).map(o => `${spacings}${symbolSpecifier_1.generateSymbolSpecifier(o)}`).join(',\n'), multiLineTrailingComma ? ',' : '', `${stringQuoteStyle}${imp.libraryName}${stringQuoteStyle}${eol}`, imp.defaultAlias ? `${imp.defaultAlias}, ` : '');
    }
    return importString;
}
exports.generateNamedImport = generateNamedImport;
function getImportSpecifiers(namedImport, spaceBraces) {
    if (namedImport.defaultAlias && namedImport.specifiers.length <= 0) {
        return namedImport.defaultAlias;
    }
    const space = spaceBraces ? ' ' : '';
    const specifiers = namedImport.specifiers.sort(specifierSort).map(o => symbolSpecifier_1.generateSymbolSpecifier(o)).join(', ');
    let importSpecifiers = `${space}${specifiers}${space}`;
    if (importSpecifiers.trim().length === 0) {
        importSpecifiers = ' ';
    }
    if (namedImport.defaultAlias && namedImport.specifiers.length > 0) {
        return `${namedImport.defaultAlias}, {${importSpecifiers}}`;
    }
    return `{${importSpecifiers}}`;
}
