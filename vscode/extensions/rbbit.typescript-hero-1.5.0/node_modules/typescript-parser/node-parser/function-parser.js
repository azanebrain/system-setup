"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typescript_1 = require("typescript");
const DefaultDeclaration_1 = require("../declarations/DefaultDeclaration");
const FunctionDeclaration_1 = require("../declarations/FunctionDeclaration");
const ParameterDeclaration_1 = require("../declarations/ParameterDeclaration");
const TypescriptGuards_1 = require("../type-guards/TypescriptGuards");
const identifier_parser_1 = require("./identifier-parser");
const parse_utilities_1 = require("./parse-utilities");
const variable_parser_1 = require("./variable-parser");
/**
 * Parse the parts of a function. All functions / methods contain various information about used variables
 * and parameters.
 *
 * @export
 * @param {Resource} resource
 * @param {(TshConstructor | TshMethod | TshFunction)} parent
 * @param {Node} node
 */
function parseFunctionParts(resource, parent, node) {
    for (const child of node.getChildren()) {
        switch (child.kind) {
            case typescript_1.SyntaxKind.Identifier:
                identifier_parser_1.parseIdentifier(resource, child);
                break;
            case typescript_1.SyntaxKind.VariableStatement:
                variable_parser_1.parseVariable(parent, child);
                break;
            default:
                break;
        }
        parseFunctionParts(resource, parent, child);
    }
}
exports.parseFunctionParts = parseFunctionParts;
/**
 * Parse method parameters.
 *
 * @export
 * @param {(FunctionDeclaration | MethodDeclaration | MethodSignature)} node
 * @returns {TshParameter[]}
 */
function parseMethodParams(node) {
    return node.parameters.reduce((all, cur) => {
        let params = all;
        if (TypescriptGuards_1.isIdentifier(cur.name)) {
            params.push(new ParameterDeclaration_1.ParameterDeclaration(cur.name.text, parse_utilities_1.getNodeType(cur.type), cur.getStart(), cur.getEnd()));
        }
        else if (TypescriptGuards_1.isObjectBindingPattern(cur.name) || TypescriptGuards_1.isArrayBindingPattern(cur.name)) {
            const identifiers = cur.name;
            const elements = [...identifiers.elements];
            params = params.concat(elements.map((o) => {
                if (TypescriptGuards_1.isIdentifier(o.name)) {
                    return new ParameterDeclaration_1.ParameterDeclaration(o.name.text, undefined, o.getStart(), o.getEnd());
                }
            }).filter(Boolean));
        }
        return params;
    }, []);
}
exports.parseMethodParams = parseMethodParams;
/**
 * Parses a function into its declaration.
 * Parses the functions sub information like parameters and variables.
 *
 * @export
 * @param {Resource} resource
 * @param {FunctionDeclaration} node
 */
function parseFunction(resource, node) {
    const name = node.name ? node.name.text : parse_utilities_1.getDefaultResourceIdentifier(resource);
    const func = new FunctionDeclaration_1.FunctionDeclaration(name, parse_utilities_1.isNodeExported(node), parse_utilities_1.getNodeType(node.type), node.getStart(), node.getEnd());
    if (parse_utilities_1.isNodeDefaultExported(node)) {
        func.isExported = false;
        resource.declarations.push(new DefaultDeclaration_1.DefaultDeclaration(func.name, resource));
    }
    func.parameters = parseMethodParams(node);
    resource.declarations.push(func);
    parseFunctionParts(resource, func, node);
}
exports.parseFunction = parseFunction;
