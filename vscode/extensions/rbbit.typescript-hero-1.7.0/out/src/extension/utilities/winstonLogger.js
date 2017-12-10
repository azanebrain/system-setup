"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path_1 = require("path");
const vscode_1 = require("vscode");
const { createLogger, exceptions, format, transports } = require('winston');
const transport = require('winston-transport');
const { LEVEL, MESSAGE } = require('triple-beam');
const { combine, timestamp, printf } = format;
const Transport = transport;
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
};
class OutputWindowTransport extends Transport {
    constructor(opts, channel) {
        super(opts);
        this.channel = channel;
    }
    log(info, callback) {
        setImmediate(() => {
            this.emit('logged', info);
        });
        this.channel.appendLine(info[MESSAGE]);
        callback();
    }
}
class ConsoleLogTransport extends Transport {
    constructor(opts) {
        super(opts);
    }
    log(info, callback) {
        setImmediate(() => {
            this.emit('logged', info);
        });
        const level = info[LEVEL];
        switch (level) {
            case 'error':
                console.error(info[MESSAGE]);
                break;
            case 'warn':
                console.warn(info[MESSAGE]);
                break;
            default:
                console.log(info[MESSAGE]);
                break;
        }
        callback();
    }
}
class HandleUncatchedException extends Transport {
    constructor(path) {
        super();
        this.path = path;
    }
    log(info, callback) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            setImmediate(() => {
                this.emit('logged', info);
            });
            const result = yield vscode_1.window.showErrorMessage('There was an uncought exception, do you want to see the logfile?', { modal: true }, 'Yes, show me.');
            if (result) {
                const doc = yield vscode_1.workspace.openTextDocument(path_1.join(this.path, 'typescript-hero.log'));
                yield vscode_1.window.showTextDocument(doc);
            }
            callback();
        });
    }
}
const loggerTransports = [
    new ConsoleLogTransport({
        level: !!process.env.CI ? 'error' : 'debug',
    }),
];
function winstonLogger(verbosity, context) {
    const level = !!process.env.CI ? 'error' : verbosity;
    if (!process.env.CI && !process.env.EXT_DEBUG) {
        const channel = vscode_1.window.createOutputChannel('TypeScript Hero');
        context.subscriptions.push(channel);
        const fileHandler = new transports.File({
            level: ['info', 'debug'].indexOf(level) >= 0 ? level : 'info',
            exitOnError: false,
            filename: 'typescript-hero.log',
            dirname: context.extensionPath,
            maxsize: 1024 * 1024,
            maxFiles: 1,
            tailable: true,
        });
        const outputHandler = new OutputWindowTransport({ exitOnError: false }, channel);
        loggerTransports.push(fileHandler);
        loggerTransports.push(outputHandler);
        exceptions.handle(fileHandler);
        exceptions.handle(outputHandler);
        exceptions.handle(new HandleUncatchedException(context.extensionPath));
    }
    const logger = createLogger({
        level,
        levels,
        format: combine(format.splat(), timestamp(), printf((info) => {
            const message = `${info.timestamp} - ${info.level}: ${info.message}`;
            const data = Object.assign({}, info, { level: undefined, message: undefined, splat: undefined, timestamp: undefined });
            if (Object.keys(data).filter(key => !!data[key]).length > 0) {
                return `${message} ${JSON.stringify(data)}`;
            }
            return message;
        })),
        transports: loggerTransports,
    });
    logger.exitOnError = false;
    return logger;
}
exports.default = winstonLogger;
