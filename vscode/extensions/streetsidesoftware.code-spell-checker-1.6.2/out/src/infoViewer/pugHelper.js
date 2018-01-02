"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const pug = require("pug");
const cache = new Map();
const baseDir = __dirname.replace(/(?:out.)?src.*$/, '');
exports.templateDir = path.join(baseDir, 'templates');
function compile(templateName) {
    if (!cache.has(templateName)) {
        const filename = path.join(exports.templateDir, templateName);
        cache.set(templateName, pug.compileFile(filename));
    }
    return cache.get(templateName);
}
exports.compile = compile;
function render(templateName, params) {
    const fn = compile(templateName);
    return fn(Object.assign({}, params, { templateDir: exports.templateDir }));
}
exports.render = render;
//# sourceMappingURL=pugHelper.js.map