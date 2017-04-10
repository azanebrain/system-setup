'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const _debounce = require('lodash.debounce');
const _once = require('lodash.once');
var Functions;
(function (Functions) {
    function debounce(fn, wait, options) {
        return _debounce(fn, wait, options);
    }
    Functions.debounce = debounce;
    function once(fn) {
        return _once(fn);
    }
    Functions.once = once;
    ;
})(Functions = exports.Functions || (exports.Functions = {}));
//# sourceMappingURL=function.js.map