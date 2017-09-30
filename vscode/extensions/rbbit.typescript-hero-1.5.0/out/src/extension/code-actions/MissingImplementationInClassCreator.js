"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const typescript_parser_1 = require("typescript-parser");
const helpers_1 = require("../../common/helpers");
const IoCSymbols_1 = require("../IoCSymbols");
const CodeAction_1 = require("./CodeAction");
const CodeActionCreator_1 = require("./CodeActionCreator");
let MissingImplementationInClassCreator = class MissingImplementationInClassCreator extends CodeActionCreator_1.CodeActionCreator {
    constructor(parser, index, rootPath) {
        super();
        this.parser = parser;
        this.index = index;
        this.rootPath = rootPath;
    }
    canHandleDiagnostic(diagnostic) {
        return /class ['"](.*)['"] incorrectly implements.*['"](.*)['"]\./ig.test(diagnostic.message) ||
            /non-abstract class ['"](.*)['"].*implement inherited.*from class ['"](.*)['"]\./ig.test(diagnostic.message);
    }
    handleDiagnostic(document, commands, diagnostic) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const match = /class ['"](.*)['"] incorrectly implements.*['"](.*)['"]\./ig.exec(diagnostic.message) ||
                /non-abstract class ['"](.*)['"].*implement inherited.*from class ['"](.*)['"]\./ig.exec(diagnostic.message);
            if (!match) {
                return commands;
            }
            let specifier = match[2];
            let types;
            let typeParams;
            const genericMatch = /^(.*)[<](.*)[>]$/.exec(specifier);
            if (genericMatch) {
                specifier = genericMatch[1];
                types = genericMatch[2].split(',').map(t => t.trim());
            }
            const parsedDocument = yield this.parser.parseSource(document.getText());
            const alreadyImported = parsedDocument.imports.find(o => o instanceof typescript_parser_1.NamedImport && o.specifiers.some(s => s.specifier === specifier));
            const declaration = (parsedDocument.declarations.find(o => o.name === specifier) ||
                (this.index.declarationInfos.find(o => o.declaration.name === specifier &&
                    o.from === helpers_1.getAbsolutLibraryName(alreadyImported.libraryName, document.fileName, this.rootPath)) || { declaration: undefined }).declaration);
            if (commands.some((o) => o.title.indexOf(specifier) >= 0)) {
                return commands;
            }
            if (!declaration) {
                commands.push(this.createCommand(`Cannot find "${specifier}" in the index or the actual file.`, new CodeAction_1.NoopCodeAction()));
                return commands;
            }
            if (genericMatch && declaration.typeParameters && types) {
                typeParams = {};
                for (const typeParam of declaration.typeParameters) {
                    typeParams[typeParam] = types[declaration.typeParameters.indexOf(typeParam)];
                }
            }
            commands.push(this.createCommand(`Implement missing elements from "${genericMatch && types ? `${specifier}<${types.join(', ')}>` : specifier}".`, new CodeAction_1.ImplementPolymorphElements(document, match[1], declaration, typeParams)));
            return commands;
        });
    }
};
MissingImplementationInClassCreator = tslib_1.__decorate([
    inversify_1.injectable(),
    tslib_1.__param(0, inversify_1.inject(IoCSymbols_1.iocSymbols.typescriptParser)),
    tslib_1.__param(1, inversify_1.inject(IoCSymbols_1.iocSymbols.declarationIndex)),
    tslib_1.__param(2, inversify_1.inject(IoCSymbols_1.iocSymbols.rootPath)),
    tslib_1.__metadata("design:paramtypes", [typescript_parser_1.TypescriptParser,
        typescript_parser_1.DeclarationIndex, String])
], MissingImplementationInClassCreator);
exports.MissingImplementationInClassCreator = MissingImplementationInClassCreator;
