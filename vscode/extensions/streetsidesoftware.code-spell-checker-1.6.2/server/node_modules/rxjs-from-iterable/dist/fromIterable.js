"use strict";
const Rx = require("rxjs/Rx");
function observableFromIterable(i) {
    return Rx.Observable.from(i);
}
exports.observableFromIterable = observableFromIterable;
function observableFromSet(i) {
    return observableFromIterable(i);
}
exports.observableFromSet = observableFromSet;
function observableFromMap(i) {
    return observableFromIterable(i);
}
exports.observableFromMap = observableFromMap;
//# sourceMappingURL=fromIterable.js.map