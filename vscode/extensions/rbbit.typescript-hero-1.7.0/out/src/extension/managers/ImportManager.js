"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const typescript_parser_1 = require("typescript-parser");
const vscode_1 = require("vscode");
const helpers_1 = require("../../common/helpers");
const quick_pick_items_1 = require("../../common/quick-pick-items");
const helpers_2 = require("../helpers");
const IoC_1 = require("../IoC");
const IoCSymbols_1 = require("../IoCSymbols");
const utilityFunctions_1 = require("../utilities/utilityFunctions");
function sameSpecifiers(specs1, specs2) {
    for (const spec of specs1) {
        const spec2 = specs2[specs1.indexOf(spec)];
        if (!spec2 ||
            spec.specifier !== spec2.specifier ||
            spec.alias !== spec2.alias) {
            return false;
        }
    }
    return true;
}
class ImportManager {
    constructor(document, _parsedDocument) {
        this.document = document;
        this._parsedDocument = _parsedDocument;
        this.imports = [];
        this.userImportDecisions = [];
        ImportManager.logger.debug('[%s] create import manager', ImportManager.name, { file: document.fileName });
        this.reset();
    }
    static get parser() {
        return IoC_1.Container.get(IoCSymbols_1.iocSymbols.typescriptParser);
    }
    static get config() {
        return IoC_1.Container.get(IoCSymbols_1.iocSymbols.configuration);
    }
    static get generator() {
        return IoC_1.Container.get(IoCSymbols_1.iocSymbols.generatorFactory)();
    }
    static get logger() {
        return IoC_1.Container.get(IoCSymbols_1.iocSymbols.logger);
    }
    get config() {
        return ImportManager.config(this.document.uri);
    }
    get rootPath() {
        const rootFolder = vscode_1.workspace.getWorkspaceFolder(this.document.uri);
        return rootFolder ? rootFolder.uri.fsPath : undefined;
    }
    get parsedDocument() {
        return this._parsedDocument;
    }
    static create(document) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const source = yield ImportManager.parser.parseSource(document.getText());
            return new ImportManager(document, source);
        });
    }
    reset() {
        this.imports = this._parsedDocument.imports.map(o => o.clone());
        this.importGroups = this.config.resolver.importGroups;
        this.addImportsToGroups(this.imports);
    }
    addDeclarationImport(declarationInfo) {
        ImportManager.logger.debug('[%s] add declaration as import', ImportManager.name, { file: this.document.fileName, specifier: declarationInfo.declaration.name, library: declarationInfo.from });
        const alreadyImported = this.imports.find(o => declarationInfo.from === helpers_1.getAbsolutLibraryName(o.libraryName, this.document.fileName, this.rootPath) && o instanceof typescript_parser_1.NamedImport);
        if (alreadyImported) {
            if (declarationInfo.declaration instanceof typescript_parser_1.DefaultDeclaration) {
                delete alreadyImported.defaultAlias;
                alreadyImported.defaultAlias = declarationInfo.declaration.name;
            }
            else if (!alreadyImported.specifiers.some(o => o.specifier === declarationInfo.declaration.name)) {
                alreadyImported.specifiers.push(new typescript_parser_1.SymbolSpecifier(declarationInfo.declaration.name));
            }
        }
        else {
            let imp = new typescript_parser_1.NamedImport(helpers_1.getRelativeLibraryName(declarationInfo.from, this.document.fileName, this.rootPath));
            if (declarationInfo.declaration instanceof typescript_parser_1.ModuleDeclaration) {
                imp = new typescript_parser_1.NamespaceImport(declarationInfo.from, declarationInfo.declaration.name);
            }
            else if (declarationInfo.declaration instanceof typescript_parser_1.DefaultDeclaration) {
                imp.defaultAlias = declarationInfo.declaration.name;
            }
            else {
                imp.specifiers.push(new typescript_parser_1.SymbolSpecifier(declarationInfo.declaration.name));
            }
            this.imports.push(imp);
            this.addImportsToGroups([imp]);
        }
        return this;
    }
    addMissingImports(index) {
        ImportManager.logger.debug('[%s] add all missing imports', ImportManager.name, { file: this.document.fileName });
        const declarations = helpers_1.getDeclarationsFilteredByImports(index.declarationInfos, this.document.fileName, this.imports, this.rootPath);
        for (const usage of this._parsedDocument.nonLocalUsages) {
            const foundDeclarations = declarations.filter(o => o.declaration.name === usage);
            if (foundDeclarations.length <= 0) {
                continue;
            }
            else if (foundDeclarations.length === 1) {
                this.addDeclarationImport(foundDeclarations[0]);
            }
            else {
                this.userImportDecisions[usage] = foundDeclarations;
            }
        }
        return this;
    }
    organizeImports() {
        ImportManager.logger.debug('[%s] organize the imports', ImportManager.name, { file: this.document.fileName });
        this.organize = true;
        let keep = [];
        if (this.config.resolver.disableImportRemovalOnOrganize) {
            keep = this.imports;
        }
        else {
            for (const actImport of this.imports) {
                if (this.config.resolver.ignoreImportsForOrganize.indexOf(actImport.libraryName) >= 0) {
                    keep.push(actImport);
                    continue;
                }
                if (actImport instanceof typescript_parser_1.NamespaceImport ||
                    actImport instanceof typescript_parser_1.ExternalModuleImport) {
                    if (this._parsedDocument.nonLocalUsages.indexOf(actImport.alias) > -1) {
                        keep.push(actImport);
                    }
                }
                else if (actImport instanceof typescript_parser_1.NamedImport) {
                    actImport.specifiers = actImport.specifiers
                        .filter(o => this._parsedDocument.nonLocalUsages.indexOf(o.alias || o.specifier) > -1)
                        .sort(utilityFunctions_1.specifierSort);
                    const defaultSpec = actImport.defaultAlias;
                    if (actImport.specifiers.length ||
                        (!!defaultSpec && this._parsedDocument.nonLocalUsages.indexOf(defaultSpec) >= 0)) {
                        keep.push(actImport);
                    }
                }
                else if (actImport instanceof typescript_parser_1.StringImport) {
                    keep.push(actImport);
                }
            }
        }
        if (!this.config.resolver.disableImportSorting) {
            keep = [
                ...keep.filter(o => o instanceof typescript_parser_1.StringImport).sort(utilityFunctions_1.importSort),
                ...keep.filter(o => !(o instanceof typescript_parser_1.StringImport)).sort(utilityFunctions_1.importSort),
            ];
        }
        for (const group of this.importGroups) {
            group.reset();
        }
        this.imports = keep;
        this.addImportsToGroups(this.imports);
        return this;
    }
    commit() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.resolveImportSpecifiers();
            const edits = this.calculateTextEdits();
            const workspaceEdit = new vscode_1.WorkspaceEdit();
            workspaceEdit.set(this.document.uri, edits);
            ImportManager.logger.debug('[%s] commit the file', ImportManager.name, { file: this.document.fileName });
            const result = yield vscode_1.workspace.applyEdit(workspaceEdit);
            if (result) {
                delete this.organize;
                this._parsedDocument = yield ImportManager.parser.parseSource(this.document.getText());
                this.imports = this._parsedDocument.imports.map(o => o.clone());
                for (const group of this.importGroups) {
                    group.reset();
                }
                this.addImportsToGroups(this.imports);
            }
            return result;
        });
    }
    calculateTextEdits() {
        const edits = [];
        if (this.organize) {
            for (const imp of this._parsedDocument.imports) {
                edits.push(vscode_1.TextEdit.delete(helpers_2.importRange(this.document, imp.start, imp.end)));
                if (imp.end !== undefined) {
                    const nextLine = this.document.lineAt(this.document.positionAt(imp.end).line + 1);
                    if (nextLine.text === '') {
                        edits.push(vscode_1.TextEdit.delete(nextLine.rangeIncludingLineBreak));
                    }
                }
            }
            const imports = this.importGroups
                .map(group => ImportManager.generator.generate(group))
                .filter(Boolean)
                .join('\n');
            if (!!imports) {
                edits.push(vscode_1.TextEdit.insert(helpers_1.getImportInsertPosition(vscode_1.window.activeTextEditor), `${imports}\n`));
            }
        }
        else {
            for (const imp of this._parsedDocument.imports) {
                if (!this.imports.some(o => o.libraryName === imp.libraryName)) {
                    edits.push(vscode_1.TextEdit.delete(helpers_2.importRange(this.document, imp.start, imp.end)));
                }
            }
            const actualDocumentsNamed = this._parsedDocument.imports.filter(o => o instanceof typescript_parser_1.NamedImport);
            for (const imp of this.imports) {
                if (imp instanceof typescript_parser_1.NamedImport &&
                    actualDocumentsNamed.some((o) => o.libraryName === imp.libraryName &&
                        o.defaultAlias === imp.defaultAlias &&
                        o.specifiers.length === imp.specifiers.length &&
                        sameSpecifiers(o.specifiers, imp.specifiers))) {
                    continue;
                }
                if (imp.isNew) {
                    edits.push(vscode_1.TextEdit.insert(helpers_1.getImportInsertPosition(vscode_1.window.activeTextEditor), ImportManager.generator.generate(imp) + '\n'));
                }
                else {
                    edits.push(vscode_1.TextEdit.replace(new vscode_1.Range(this.document.positionAt(imp.start), this.document.positionAt(imp.end)), ImportManager.generator.generate(imp)));
                }
            }
        }
        return edits;
    }
    addImportsToGroups(imports) {
        for (const tsImport of imports) {
            for (const group of this.importGroups) {
                if (group.processImport(tsImport)) {
                    break;
                }
            }
        }
    }
    resolveImportSpecifiers() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const getSpecifiers = () => this.imports
                .reduce((all, cur) => {
                let specifiers = all;
                if (cur instanceof typescript_parser_1.NamedImport) {
                    specifiers = specifiers.concat(cur.specifiers.map(o => o.alias || o.specifier));
                    if (cur.defaultAlias) {
                        specifiers.push(cur.defaultAlias);
                    }
                }
                if (typescript_parser_1.isAliasedImport(cur)) {
                    specifiers.push(cur.alias);
                }
                return specifiers;
            }, []);
            for (const decision of Object.keys(this.userImportDecisions).filter(o => this.userImportDecisions[o].length > 0)) {
                const declarations = this.userImportDecisions[decision].map(o => new quick_pick_items_1.ResolveQuickPickItem(o));
                const result = yield vscode_1.window.showQuickPick(declarations, {
                    placeHolder: `Multiple declarations for "${decision}" found.`,
                });
                if (result) {
                    this.addDeclarationImport(result.declarationInfo);
                }
            }
            const named = this.imports.filter(o => o instanceof typescript_parser_1.NamedImport);
            for (const imp of named) {
                if (imp.defaultAlias) {
                    const specifiers = getSpecifiers();
                    if (specifiers.filter(o => o === imp.defaultAlias).length > 1 &&
                        this.config.resolver.promptForSpecifiers) {
                        imp.defaultAlias = yield this.getDefaultIdentifier(imp.defaultAlias);
                    }
                }
                for (const spec of imp.specifiers) {
                    const specifiers = getSpecifiers();
                    if (specifiers.filter(o => o === (spec.alias || spec.specifier)).length > 1 &&
                        this.config.resolver.promptForSpecifiers) {
                        spec.alias = yield this.getSpecifierAlias(spec.alias || spec.specifier);
                    }
                }
            }
        });
    }
    getSpecifierAlias(specifierName) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const result = yield this.vscodeInputBox({
                placeHolder: `Alias for specifier "${specifierName}"`,
                prompt: `Please enter an alias for the specifier "${specifierName}"...`,
                validateInput: s => !!s ? '' : 'Please enter a variable name',
            });
            return !!result ? result : undefined;
        });
    }
    getDefaultIdentifier(declarationName) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const result = yield this.vscodeInputBox({
                placeHolder: 'Default export name',
                prompt: 'Please enter an alias name for the default export...',
                validateInput: s => !!s ? '' : 'Please enter a variable name',
                value: declarationName,
            });
            return !!result ? result.replace(/[,.-_]/g, '') : undefined;
        });
    }
    vscodeInputBox(options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield vscode_1.window.showInputBox(options);
        });
    }
}
exports.ImportManager = ImportManager;
