"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const IoCSymbols_1 = require("../IoCSymbols");
const DeclarationIndexMapper_1 = require("../utilities/DeclarationIndexMapper");
const CodeAction_1 = require("./CodeAction");
const CodeActionCreator_1 = require("./CodeActionCreator");
let MissingImportCreator = MissingImportCreator_1 = class MissingImportCreator extends CodeActionCreator_1.CodeActionCreator {
    constructor(indices, logger) {
        super();
        this.indices = indices;
        this.logger = logger;
    }
    canHandleDiagnostic(diagnostic) {
        return /cannot find name ['"](.*)['"]/ig.test(diagnostic.message);
    }
    handleDiagnostic(document, commands, diagnostic) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const match = /cannot find name ['"](.*)['"]/ig.exec(diagnostic.message);
            const index = this.indices.getIndexForFile(document.uri);
            if (!match || !index) {
                this.logger.debug('[%s] cannot handle the diagnostic', MissingImportCreator_1.name);
                return commands;
            }
            const infos = index.declarationInfos.filter(o => o.declaration.name === match[1]);
            if (infos.length > 0) {
                for (const info of infos) {
                    commands.push(this.createCommand(`Import "${info.declaration.name}" from "${info.from}".`, new CodeAction_1.AddImportCodeAction(document, info)));
                    this.logger.debug('[%s] add command to import missing specifier', MissingImportCreator_1.name, { symbol: info.declaration.name, library: info.from });
                }
                if (!commands.some(o => o.arguments !== undefined &&
                    o.arguments.some(a => a instanceof CodeAction_1.AddMissingImportsCodeAction))) {
                    commands.push(this.createCommand('Add all missing imports if possible.', new CodeAction_1.AddMissingImportsCodeAction(document, index)));
                    this.logger.debug('[%s] add "import all missing imports" command', MissingImportCreator_1.name);
                }
            }
            else {
                commands.push(this.createCommand(`Cannot find "${match[1]}" in the index.`, new CodeAction_1.NoopCodeAction()));
                this.logger.debug('[%s] class not found in index', MissingImportCreator_1.name, { specifier: match[1] });
            }
            return commands;
        });
    }
};
MissingImportCreator = MissingImportCreator_1 = tslib_1.__decorate([
    inversify_1.injectable(),
    tslib_1.__param(0, inversify_1.inject(IoCSymbols_1.iocSymbols.declarationIndexMapper)),
    tslib_1.__param(1, inversify_1.inject(IoCSymbols_1.iocSymbols.logger)),
    tslib_1.__metadata("design:paramtypes", [DeclarationIndexMapper_1.DeclarationIndexMapper, Object])
], MissingImportCreator);
exports.MissingImportCreator = MissingImportCreator;
var MissingImportCreator_1;
