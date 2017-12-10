"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
let BaseExtension = class BaseExtension {
    constructor(context) {
        this.context = context;
    }
};
BaseExtension = tslib_1.__decorate([
    inversify_1.injectable(),
    tslib_1.__metadata("design:paramtypes", [Object])
], BaseExtension);
exports.BaseExtension = BaseExtension;
