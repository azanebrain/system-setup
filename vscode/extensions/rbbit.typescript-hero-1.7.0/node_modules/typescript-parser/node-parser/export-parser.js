"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DefaultDeclaration_1 = require("../declarations/DefaultDeclaration");
const AllExport_1 = require("../exports/AllExport");
const AssignedExport_1 = require("../exports/AssignedExport");
const NamedExport_1 = require("../exports/NamedExport");
const SymbolSpecifier_1 = require("../SymbolSpecifier");
const TypescriptGuards_1 = require("../type-guards/TypescriptGuards");
const parse_utilities_1 = require("./parse-utilities");
/**
 * Parses an export node into the declaration.
 *
 * @export
 * @param {Resource} resource
 * @param {(ExportDeclaration | ExportAssignment)} node
 */
function parseExport(resource, node) {
    if (TypescriptGuards_1.isExportDeclaration(node)) {
        const tsExport = node;
        if (!TypescriptGuards_1.isStringLiteral(tsExport.moduleSpecifier)) {
            return;
        }
        if (tsExport.getText().indexOf('*') > -1) {
            resource.exports.push(new AllExport_1.AllExport(node.getStart(), node.getEnd(), tsExport.moduleSpecifier.text));
        }
        else if (tsExport.exportClause && TypescriptGuards_1.isNamedExports(tsExport.exportClause)) {
            const lib = tsExport.moduleSpecifier;
            const ex = new NamedExport_1.NamedExport(node.getStart(), node.getEnd(), lib.text);
            ex.specifiers = tsExport.exportClause.elements.map(o => o.propertyName && o.name ?
                new SymbolSpecifier_1.SymbolSpecifier(o.propertyName.text, o.name.text) :
                new SymbolSpecifier_1.SymbolSpecifier(o.name.text));
            resource.exports.push(ex);
        }
    }
    else {
        const literal = node.expression;
        if (node.isExportEquals) {
            resource.exports.push(new AssignedExport_1.AssignedExport(node.getStart(), node.getEnd(), literal.text, resource));
        }
        else {
            const name = (literal && literal.text) ? literal.text : parse_utilities_1.getDefaultResourceIdentifier(resource);
            resource.declarations.push(new DefaultDeclaration_1.DefaultDeclaration(name, resource));
        }
    }
}
exports.parseExport = parseExport;
