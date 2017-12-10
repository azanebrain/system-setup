"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const typescript_parser_1 = require("typescript-parser");
const vscode_1 = require("vscode");
const helpers_1 = require("../../common/helpers");
const IoCSymbols_1 = require("../IoCSymbols");
const DeclarationIndexMapper_1 = require("../utilities/DeclarationIndexMapper");
const CodeAction_1 = require("./CodeAction");
const CodeActionCreator_1 = require("./CodeActionCreator");
let MissingImplementationInClassCreator = MissingImplementationInClassCreator_1 = class MissingImplementationInClassCreator extends CodeActionCreator_1.CodeActionCreator {
    constructor(parser, indices, logger) {
        super();
        this.parser = parser;
        this.indices = indices;
        this.logger = logger;
    }
    canHandleDiagnostic(diagnostic) {
        return /class ['"](.*)['"] incorrectly implements.*['"](.*)['"]\./ig.test(diagnostic.message) ||
            /non-abstract class ['"](.*)['"].*implement inherited.*from class ['"](.*)['"]\./ig.test(diagnostic.message);
    }
    handleDiagnostic(document, commands, diagnostic) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const match = /class ['"](.*)['"] incorrectly implements.*['"](.*)['"]\./ig.exec(diagnostic.message) ||
                /non-abstract class ['"](.*)['"].*implement inherited.*from class ['"](.*)['"]\./ig.exec(diagnostic.message);
            const index = this.indices.getIndexForFile(document.uri);
            const rootFolder = vscode_1.workspace.getWorkspaceFolder(document.uri);
            if (!match || !index || !rootFolder) {
                this.logger.debug('[%s] cannot handle the diagnostic', MissingImplementationInClassCreator_1.name);
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
                (index.declarationInfos.find(o => o.declaration.name === specifier &&
                    o.from === helpers_1.getAbsolutLibraryName(alreadyImported.libraryName, document.fileName, rootFolder.uri.fsPath)) || { declaration: undefined }).declaration);
            if (commands.some((o) => o.title.indexOf(specifier) >= 0)) {
                this.logger.debug('[%s] command with the found class is already added', MissingImplementationInClassCreator_1.name);
                return commands;
            }
            if (!declaration) {
                this.logger.debug('[%s] class definition not found in the index', MissingImplementationInClassCreator_1.name, { specifier });
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
            this.logger.debug('[%s] adding commands to handle missing implementation', MissingImplementationInClassCreator_1.name, { specifier, types });
            return commands;
        });
    }
};
MissingImplementationInClassCreator = MissingImplementationInClassCreator_1 = tslib_1.__decorate([
    inversify_1.injectable(),
    tslib_1.__param(0, inversify_1.inject(IoCSymbols_1.iocSymbols.typescriptParser)),
    tslib_1.__param(1, inversify_1.inject(IoCSymbols_1.iocSymbols.declarationIndexMapper)),
    tslib_1.__param(2, inversify_1.inject(IoCSymbols_1.iocSymbols.logger)),
    tslib_1.__metadata("design:paramtypes", [typescript_parser_1.TypescriptParser,
        DeclarationIndexMapper_1.DeclarationIndexMapper, Object])
], MissingImplementationInClassCreator);
exports.MissingImplementationInClassCreator = MissingImplementationInClassCreator;
var MissingImplementationInClassCreator_1;
