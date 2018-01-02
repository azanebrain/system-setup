"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const IoCSymbols_1 = require("./IoCSymbols");
let TypeScriptHero = TypeScriptHero_1 = class TypeScriptHero {
    constructor(logger, extensions) {
        this.logger = logger;
        this.extensions = extensions;
        this.logger.debug('[%s] activation event, initializing', TypeScriptHero_1.name);
        this.extensions.forEach(o => o.initialize());
        this.logger.info('[%s] initialized', TypeScriptHero_1.name);
    }
    dispose() {
        this.logger.debug('[%s] deactivation event, disposing', TypeScriptHero_1.name);
        for (const ext of this.extensions) {
            ext.dispose();
        }
        this.logger.info('[%s] disposed', TypeScriptHero_1.name);
    }
};
TypeScriptHero = TypeScriptHero_1 = tslib_1.__decorate([
    inversify_1.injectable(),
    tslib_1.__param(0, inversify_1.inject(IoCSymbols_1.iocSymbols.logger)),
    tslib_1.__param(1, inversify_1.multiInject(IoCSymbols_1.iocSymbols.extensions)),
    tslib_1.__metadata("design:paramtypes", [Object, Array])
], TypeScriptHero);
exports.TypeScriptHero = TypeScriptHero;
var TypeScriptHero_1;
