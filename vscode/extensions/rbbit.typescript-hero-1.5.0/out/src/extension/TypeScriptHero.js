"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const IoCSymbols_1 = require("./IoCSymbols");
let TypeScriptHero = class TypeScriptHero {
    constructor(loggerFactory, extensions) {
        this.extensions = extensions;
        this.logger = loggerFactory('TypescriptHero');
        this.logger.info('Activation event called. TypeScriptHero instantiated.');
        this.extensions.forEach(o => o.initialize());
    }
    dispose() {
        this.logger.info('Deactivation event called. Disposing TypeScriptHero.');
        for (const ext of this.extensions) {
            ext.dispose();
        }
    }
};
TypeScriptHero = tslib_1.__decorate([
    inversify_1.injectable(),
    tslib_1.__param(0, inversify_1.inject(IoCSymbols_1.iocSymbols.loggerFactory)),
    tslib_1.__param(1, inversify_1.multiInject(IoCSymbols_1.iocSymbols.extensions)),
    tslib_1.__metadata("design:paramtypes", [Function, Array])
], TypeScriptHero);
exports.TypeScriptHero = TypeScriptHero;
