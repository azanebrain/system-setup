"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typescript_parser_1 = require("typescript-parser");
const vscode_1 = require("vscode");
function stringSort(strA, strB, order = 'asc') {
    let result = 0;
    if (strA < strB) {
        result = -1;
    }
    else if (strA > strB) {
        result = 1;
    }
    if (order === 'desc') {
        result *= -1;
    }
    return result;
}
exports.stringSort = stringSort;
function importSort(i1, i2, order = 'asc') {
    const strA = i1.libraryName.toLowerCase();
    const strB = i2.libraryName.toLowerCase();
    return stringSort(strA, strB, order);
}
exports.importSort = importSort;
function specifierSort(i1, i2) {
    return stringSort(i1.specifier, i2.specifier);
}
exports.specifierSort = specifierSort;
function getItemKind(declaration) {
    switch (true) {
        case declaration instanceof typescript_parser_1.ClassDeclaration:
            return vscode_1.CompletionItemKind.Class;
        case declaration instanceof typescript_parser_1.ConstructorDeclaration:
            return vscode_1.CompletionItemKind.Constructor;
        case declaration instanceof typescript_parser_1.DefaultDeclaration:
            return vscode_1.CompletionItemKind.File;
        case declaration instanceof typescript_parser_1.EnumDeclaration:
            return vscode_1.CompletionItemKind.Enum;
        case declaration instanceof typescript_parser_1.FunctionDeclaration:
            return vscode_1.CompletionItemKind.Function;
        case declaration instanceof typescript_parser_1.InterfaceDeclaration:
            return vscode_1.CompletionItemKind.Interface;
        case declaration instanceof typescript_parser_1.MethodDeclaration:
            return vscode_1.CompletionItemKind.Method;
        case declaration instanceof typescript_parser_1.ModuleDeclaration:
            return vscode_1.CompletionItemKind.Module;
        case declaration instanceof typescript_parser_1.ParameterDeclaration:
            return vscode_1.CompletionItemKind.Variable;
        case declaration instanceof typescript_parser_1.PropertyDeclaration:
            return vscode_1.CompletionItemKind.Property;
        case declaration instanceof typescript_parser_1.TypeAliasDeclaration:
            return vscode_1.CompletionItemKind.TypeParameter;
        case declaration instanceof typescript_parser_1.VariableDeclaration:
            const variable = declaration;
            return variable.isConst ?
                vscode_1.CompletionItemKind.Constant :
                vscode_1.CompletionItemKind.Variable;
        case declaration instanceof typescript_parser_1.GetterDeclaration:
        case declaration instanceof typescript_parser_1.SetterDeclaration:
            return vscode_1.CompletionItemKind.Method;
        default:
            return vscode_1.CompletionItemKind.Reference;
    }
}
exports.getItemKind = getItemKind;
