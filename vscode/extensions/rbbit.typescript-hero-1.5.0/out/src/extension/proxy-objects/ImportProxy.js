"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typescript_parser_1 = require("typescript-parser");
class ImportProxy extends typescript_parser_1.NamedImport {
    constructor(library, start, end) {
        super(typeof library !== 'string' ? library.libraryName : library, start, end);
        if (typeof library !== 'string') {
            this.start = library.start;
            this.end = library.end;
            if (library instanceof typescript_parser_1.NamedImport) {
                this.specifiers = library.specifiers;
                const defaultSpec = this.specifiers.find(o => o.specifier === 'default');
                if (defaultSpec) {
                    this.specifiers.splice(this.specifiers.indexOf(defaultSpec), 1);
                    this.defaultAlias = defaultSpec.alias;
                }
            }
            else {
                this.defaultAlias = library.alias;
            }
        }
    }
    addSpecifier(name) {
        if (!this.specifiers.some(o => o.specifier === name)) {
            this.specifiers.push(new typescript_parser_1.SymbolSpecifier(name));
        }
    }
    clone() {
        const clone = new ImportProxy(this.libraryName, this.start, this.end);
        clone.specifiers = this.specifiers.map(o => o.clone());
        clone.defaultAlias = this.defaultAlias;
        clone.defaultPurposal = this.defaultPurposal;
        return clone;
    }
    isEqual(imp) {
        const sameSpecifiers = (specs1, specs2) => {
            for (const spec of specs1) {
                const spec2 = specs2[specs1.indexOf(spec)];
                if (!spec2 ||
                    spec.specifier !== spec2.specifier ||
                    spec.alias !== spec2.alias) {
                    return false;
                }
            }
            return true;
        };
        return this.libraryName === imp.libraryName &&
            this.defaultAlias === imp.defaultAlias &&
            this.defaultPurposal === imp.defaultPurposal &&
            this.specifiers.length === imp.specifiers.length &&
            sameSpecifiers(this.specifiers, imp.specifiers);
    }
}
exports.ImportProxy = ImportProxy;
