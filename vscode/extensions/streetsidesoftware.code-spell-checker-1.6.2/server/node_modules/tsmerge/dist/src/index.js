"use strict";
var assign = require('object-assign');
function merge() {
    var t = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        t[_i - 0] = arguments[_i];
    }
    return assign.apply(void 0, [{}].concat(t));
}
exports.merge = merge;
//# sourceMappingURL=index.js.map