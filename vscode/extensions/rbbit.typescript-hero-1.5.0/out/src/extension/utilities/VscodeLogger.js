"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
const vscode_1 = require("vscode");
class VscodeLogger {
    constructor(context, config, prefix) {
        this.config = config;
        this.prefix = prefix;
        if (!VscodeLogger.channel) {
            VscodeLogger.channel = vscode_1.window.createOutputChannel('TypeScript Hero Extension');
            context.subscriptions.push(VscodeLogger.channel);
        }
    }
    error(message, data) {
        this.log(1, 'Error', message, data);
    }
    warning(message, data) {
        this.log(2, 'Warn ', message, data);
    }
    info(message, data) {
        this.log(3, 'Info ', message, data);
    }
    log(level, severity, message, data) {
        if (this.getLogLevel() >= level) {
            const msg = `[${severity} - ${this.getDate()}] ${this.prefix ? this.prefix + ' - ' : ''}${message}`;
            if (data) {
                console.log(msg, data);
            }
            else {
                console.log(msg);
            }
            VscodeLogger.channel.appendLine(msg);
            if (data) {
                VscodeLogger.channel.appendLine(`\tData:\t${util_1.inspect(data, {})}`);
            }
        }
    }
    getDate() {
        const date = new Date();
        let hours = date.getHours().toString();
        let minutes = date.getMinutes().toString();
        let seconds = date.getSeconds().toString();
        if (hours.length < 2) {
            hours = `0${hours}`;
        }
        if (minutes.length < 2) {
            minutes = `0${minutes}`;
        }
        if (seconds.length < 2) {
            seconds = `0${seconds}`;
        }
        return `${hours}:${minutes}:${seconds}`;
    }
    getLogLevel() {
        switch (this.config.verbosity) {
            case 'Nothing':
                return 0;
            case 'Errors':
                return 1;
            case 'All':
                return 3;
            default:
                return 2;
        }
    }
}
exports.VscodeLogger = VscodeLogger;
