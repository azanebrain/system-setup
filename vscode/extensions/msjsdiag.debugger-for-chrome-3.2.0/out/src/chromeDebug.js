"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_chrome_debug_core_1 = require("vscode-chrome-debug-core");
const path = require("path");
const os = require("os");
const utils_1 = require("./utils");
const chromeDebugAdapter_1 = require("./chromeDebugAdapter");
const EXTENSION_NAME = 'debugger-for-chrome';
let versionWithDefault = typeof VERSION === 'undefined' ? 'unspecified' : VERSION; // Not built with webpack for tests
// non-.txt file types can't be uploaded to github
// also note that __dirname here is out/
const logFilePath = path.resolve(os.tmpdir(), 'vscode-chrome-debug.txt');
// Start a ChromeDebugSession configured to only match 'page' targets, which are Chrome tabs.
// Cast because DebugSession is declared twice - in this repo's vscode-debugadapter, and that of -core... TODO
vscode_chrome_debug_core_1.ChromeDebugSession.run(vscode_chrome_debug_core_1.ChromeDebugSession.getSession({
    adapter: chromeDebugAdapter_1.ChromeDebugAdapter,
    extensionName: EXTENSION_NAME,
    logFilePath,
    targetFilter: utils_1.targetFilter,
    pathTransformer: vscode_chrome_debug_core_1.UrlPathTransformer,
    sourceMapTransformer: vscode_chrome_debug_core_1.BaseSourceMapTransformer,
}));
vscode_chrome_debug_core_1.logger.log(EXTENSION_NAME + ': ' + versionWithDefault);
//# sourceMappingURL=chromeDebug.js.map