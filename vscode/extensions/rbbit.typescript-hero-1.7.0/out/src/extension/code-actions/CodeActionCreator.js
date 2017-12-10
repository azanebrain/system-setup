"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
let CodeActionCreator = class CodeActionCreator {
    createCommand(title, codeAction) {
        return {
            title,
            arguments: [codeAction],
            command: 'typescriptHero.codeFix.executeCodeAction',
        };
    }
};
CodeActionCreator = tslib_1.__decorate([
    inversify_1.injectable()
], CodeActionCreator);
exports.CodeActionCreator = CodeActionCreator;
