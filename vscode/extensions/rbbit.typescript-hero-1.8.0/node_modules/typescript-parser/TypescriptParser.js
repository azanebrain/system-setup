"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs_1 = require("fs");
const typescript_1 = require("typescript");
const path_1 = require("path");
const class_parser_1 = require("./node-parser/class-parser");
const enum_parser_1 = require("./node-parser/enum-parser");
const export_parser_1 = require("./node-parser/export-parser");
const function_parser_1 = require("./node-parser/function-parser");
const identifier_parser_1 = require("./node-parser/identifier-parser");
const import_parser_1 = require("./node-parser/import-parser");
const interface_parser_1 = require("./node-parser/interface-parser");
const module_parser_1 = require("./node-parser/module-parser");
const type_alias_parser_1 = require("./node-parser/type-alias-parser");
const variable_parser_1 = require("./node-parser/variable-parser");
const File_1 = require("./resources/File");
/**
 * Magic.happens('here');
 * This class is the parser of the whole extension. It uses the typescript compiler to parse a file or given
 * source code into the token stream and therefore into the AST of the source. Afterwards an array of
 * resources is generated and returned.
 *
 * @export
 * @class TypescriptParser
 */
class TypescriptParser {
    /**
     * Parses the given source into an anonymous File resource.
     * Mainly used to parse source code of a document.
     *
     * @param {string} source
     * @param {ScriptKind} [scriptKind=ScriptKind.TS]
     * @returns {Promise<File>}
     *
     * @memberof TsResourceParser
     */
    parseSource(source, scriptKind = typescript_1.ScriptKind.TS) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.parseTypescript(typescript_1.createSourceFile('inline.tsx', source, typescript_1.ScriptTarget.ES2015, true, scriptKind), '/');
        });
    }
    /**
     * Parses a single file into a parsed file.
     *
     * @param {string} filePath
     * @param {string} rootPath
     * @returns {Promise<File>}
     *
     * @memberof TsResourceParser
     */
    parseFile(filePath, rootPath) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const parse = yield this.parseFiles([filePath], rootPath);
            return parse[0];
        });
    }
    /**
     * Parses multiple files into parsed files.
     *
     * @param {string[]} filePathes
     * @param {string} rootPath
     * @returns {Promise<File[]>}
     *
     * @memberof TsResourceParser
     */
    parseFiles(filePathes, rootPath) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return filePathes
                .map((o) => {
                let scriptKind = typescript_1.ScriptKind.Unknown;
                const parsed = path_1.parse(o);
                switch (parsed.ext.toLowerCase()) {
                    case 'js':
                        scriptKind = typescript_1.ScriptKind.JS;
                        break;
                    case 'jsx':
                        scriptKind = typescript_1.ScriptKind.JSX;
                        break;
                    case 'ts':
                        scriptKind = typescript_1.ScriptKind.TS;
                        break;
                    case 'tsx':
                        scriptKind = typescript_1.ScriptKind.TSX;
                        break;
                }
                return typescript_1.createSourceFile(o, fs_1.readFileSync(o).toString(), typescript_1.ScriptTarget.ES2015, true, scriptKind);
            })
                .map(o => this.parseTypescript(o, rootPath));
        });
    }
    /**
     * Parses the typescript source into the file instance. Calls .parse afterwards to
     * get the declarations and other information about the source.
     *
     * @private
     * @param {SourceFile} source
     * @param {string} rootPath
     * @returns {TsFile}
     *
     * @memberof TsResourceParser
     */
    parseTypescript(source, rootPath) {
        const file = new File_1.File(source.fileName, rootPath, source.getStart(), source.getEnd());
        const syntaxList = source.getChildAt(0);
        this.parse(file, syntaxList);
        return file;
    }
    /**
     * Recursive function that runs through the AST of a source and parses the nodes.
     * Creates the class / function / etc declarations and instanciates a new module / namespace
     * resource if needed.
     *
     * @private
     * @param {Resource} resource
     * @param {Node} node
     *
     * @memberof TsResourceParser
     */
    parse(resource, node) {
        for (const child of node.getChildren()) {
            switch (child.kind) {
                case typescript_1.SyntaxKind.ImportDeclaration:
                case typescript_1.SyntaxKind.ImportEqualsDeclaration:
                    import_parser_1.parseImport(resource, child);
                    break;
                case typescript_1.SyntaxKind.ExportDeclaration:
                case typescript_1.SyntaxKind.ExportAssignment:
                    export_parser_1.parseExport(resource, child);
                    break;
                case typescript_1.SyntaxKind.EnumDeclaration:
                    enum_parser_1.parseEnum(resource, child);
                    break;
                case typescript_1.SyntaxKind.TypeAliasDeclaration:
                    type_alias_parser_1.parseTypeAlias(resource, child);
                    break;
                case typescript_1.SyntaxKind.FunctionDeclaration:
                    function_parser_1.parseFunction(resource, child);
                    continue;
                case typescript_1.SyntaxKind.VariableStatement:
                    variable_parser_1.parseVariable(resource, child);
                    break;
                case typescript_1.SyntaxKind.InterfaceDeclaration:
                    interface_parser_1.parseInterface(resource, child);
                    break;
                case typescript_1.SyntaxKind.ClassDeclaration:
                    class_parser_1.parseClass(resource, child);
                    continue;
                case typescript_1.SyntaxKind.Identifier:
                    identifier_parser_1.parseIdentifier(resource, child);
                    break;
                case typescript_1.SyntaxKind.ModuleDeclaration:
                    const newResource = module_parser_1.parseModule(resource, child);
                    this.parse(newResource, child);
                    continue;
                default:
                    break;
            }
            this.parse(resource, child);
        }
    }
}
exports.TypescriptParser = TypescriptParser;
