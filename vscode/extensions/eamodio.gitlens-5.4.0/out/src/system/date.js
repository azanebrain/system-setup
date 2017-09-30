'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
const MillisecondsPerMinute = 60000;
const MillisecondsPerDay = 86400000;
var Dates;
(function (Dates) {
    function dateDaysFromNow(date, now = Date.now()) {
        const startOfDayLeft = startOfDay(now);
        const startOfDayRight = startOfDay(date);
        const timestampLeft = startOfDayLeft.getTime() - startOfDayLeft.getTimezoneOffset() * MillisecondsPerMinute;
        const timestampRight = startOfDayRight.getTime() - startOfDayRight.getTimezoneOffset() * MillisecondsPerMinute;
        return Math.round((timestampLeft - timestampRight) / MillisecondsPerDay);
    }
    Dates.dateDaysFromNow = dateDaysFromNow;
    function startOfDay(date) {
        const newDate = new Date(typeof date === 'number' ? date : date.getTime());
        newDate.setHours(0, 0, 0, 0);
        return newDate;
    }
    Dates.startOfDay = startOfDay;
    function toFormatter(date) {
        return moment(date);
    }
    Dates.toFormatter = toFormatter;
})(Dates = exports.Dates || (exports.Dates = {}));
//# sourceMappingURL=date.js.map