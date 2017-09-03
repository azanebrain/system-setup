"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const os = require("os");
const path = require("path");
const vscode_chrome_debug_core_1 = require("vscode-chrome-debug-core");
const child_process_1 = require("child_process");
const utils = require("./utils");
const DefaultWebSourceMapPathOverrides = {
    'webpack:///./~/*': '${webRoot}/node_modules/*',
    'webpack:///./*': '${webRoot}/*',
    'webpack:///*': '*',
    'webpack:///src/*': '${webRoot}/*',
    'meteor://💻app/*': '${webRoot}/*'
};
class ChromeDebugAdapter extends vscode_chrome_debug_core_1.ChromeDebugAdapter {
    initialize(args) {
        this._overlayHelper = new utils.DebounceHelper(/*timeoutMs=*/ 200);
        const capabilities = super.initialize(args);
        capabilities.supportsRestartRequest = true;
        return capabilities;
    }
    launch(args) {
        return super.launch(args).then(() => {
            // Check exists?
            const chromePath = args.runtimeExecutable || utils.getBrowserPath();
            if (!chromePath) {
                return vscode_chrome_debug_core_1.utils.errP(`Can't find Chrome - install it or set the "runtimeExecutable" field in the launch config.`);
            }
            // Start with remote debugging enabled
            const port = args.port || 9222;
            const chromeArgs = [];
            if (!args.noDebug) {
                chromeArgs.push('--remote-debugging-port=' + port);
            }
            // Also start with extra stuff disabled
            chromeArgs.push(...['--no-first-run', '--no-default-browser-check']);
            if (args.runtimeArgs) {
                chromeArgs.push(...args.runtimeArgs);
            }
            // Set a userDataDir by default, if not disabled with 'false' or already specified
            if (typeof args.userDataDir === 'undefined' && !args.runtimeExecutable) {
                args.userDataDir = path.join(os.tmpdir(), `vscode-chrome-debug-userdatadir_${port}`);
            }
            if (args.userDataDir) {
                chromeArgs.push('--user-data-dir=' + args.userDataDir);
            }
            let launchUrl;
            if (args.file) {
                launchUrl = vscode_chrome_debug_core_1.utils.pathToFileURL(args.file);
            }
            else if (args.url) {
                launchUrl = args.url;
            }
            if (launchUrl) {
                chromeArgs.push(launchUrl);
            }
            this._chromeProc = this.spawnChrome(chromePath, chromeArgs, !!args.runtimeExecutable);
            this._chromeProc.on('error', (err) => {
                const errMsg = 'Chrome error: ' + err;
                vscode_chrome_debug_core_1.logger.error(errMsg);
                this.terminateSession(errMsg);
            });
            return args.noDebug ? undefined :
                this.doAttach(port, launchUrl || args.urlFilter, args.address, args.timeout, undefined, args.extraCRDPChannelPort);
        });
    }
    attach(args) {
        if (args.urlFilter) {
            args.url = args.urlFilter;
        }
        return super.attach(args);
    }
    commonArgs(args) {
        if (!args.webRoot && args.pathMapping && args.pathMapping['/']) {
            // Adapt pathMapping['/'] as the webRoot when not set, since webRoot is explicitly used in many places
            args.webRoot = args.pathMapping['/'];
        }
        args.sourceMaps = typeof args.sourceMaps === 'undefined' || args.sourceMaps;
        args.sourceMapPathOverrides = getSourceMapPathOverrides(args.webRoot, args.sourceMapPathOverrides);
        args.skipFileRegExps = ['^chrome-extension:.*'];
        super.commonArgs(args);
    }
    doAttach(port, targetUrl, address, timeout, websocketUrl, extraCRDPChannelPort) {
        return super.doAttach(port, targetUrl, address, timeout, websocketUrl, extraCRDPChannelPort).then(() => {
            // Don't return this promise, a failure shouldn't fail attach
            this.globalEvaluate({ expression: 'navigator.userAgent', silent: true })
                .then(evalResponse => vscode_chrome_debug_core_1.logger.log('Target userAgent: ' + evalResponse.result.value), err => vscode_chrome_debug_core_1.logger.log('Getting userAgent failed: ' + err.message))
                .then(() => {
                const cacheDisabled = this._launchAttachArgs.disableNetworkCache || false;
                this.chrome.Network.setCacheDisabled({ cacheDisabled });
            });
        });
    }
    runConnection() {
        return [
            ...super.runConnection(),
            this.chrome.Page.enable(),
            this.chrome.Network.enable({})
        ];
    }
    onPaused(notification, expectingStopReason) {
        // TODO - https://github.com/Microsoft/vscode-chrome-debug/issues/486
        this._overlayHelper.doAndCancel(() => this.chrome.Page.configureOverlay({ message: ChromeDebugAdapter.PAGE_PAUSE_MESSAGE }).catch(() => { }));
        super.onPaused(notification, expectingStopReason);
    }
    threadName() {
        return 'Chrome';
    }
    onResumed() {
        this._overlayHelper.wait(() => this.chrome.Page.configureOverlay({}).catch(() => { }));
        super.onResumed();
    }
    disconnect(args) {
        const hadTerminated = this._hasTerminated;
        // Disconnect before killing Chrome, because running "taskkill" when it's paused sometimes doesn't kill it
        super.disconnect(args);
        if (this._chromeProc && !hadTerminated) {
            // Only kill Chrome if the 'disconnect' originated from vscode. If we previously terminated
            // due to Chrome shutting down, or devtools taking over, don't kill Chrome.
            if (vscode_chrome_debug_core_1.utils.getPlatform() === 0 /* Windows */ && this._chromePID) {
                // Run synchronously because this process may be killed before exec() would run
                const taskkillCmd = `taskkill /F /T /PID ${this._chromePID}`;
                vscode_chrome_debug_core_1.logger.log(`Killing Chrome process by pid: ${taskkillCmd}`);
                try {
                    child_process_1.execSync(taskkillCmd);
                }
                catch (e) {
                    // Can fail if Chrome was already open, and the process with _chromePID is gone.
                    // Or if it already shut down for some reason.
                }
            }
            else {
                vscode_chrome_debug_core_1.logger.log('Killing Chrome process');
                this._chromeProc.kill('SIGINT');
            }
        }
        this._chromeProc = null;
    }
    /**
     * Opt-in event called when the 'reload' button in the debug widget is pressed
     */
    restart() {
        return this.chrome ?
            this.chrome.Page.reload({ ignoreCache: true }) :
            Promise.resolve();
    }
    spawnChrome(chromePath, chromeArgs, usingRuntimeExecutable) {
        if (vscode_chrome_debug_core_1.utils.getPlatform() === 0 /* Windows */ && !usingRuntimeExecutable) {
            const chromeProc = child_process_1.fork(getChromeSpawnHelperPath(), [chromePath, ...chromeArgs], { execArgv: [], silent: true });
            chromeProc.unref();
            chromeProc.on('message', data => {
                const pidStr = data.toString();
                vscode_chrome_debug_core_1.logger.log('got chrome PID: ' + pidStr);
                this._chromePID = parseInt(pidStr, 10);
            });
            chromeProc.on('error', (err) => {
                const errMsg = 'chromeSpawnHelper error: ' + err;
                vscode_chrome_debug_core_1.logger.error(errMsg);
            });
            chromeProc.stderr.on('data', data => {
                vscode_chrome_debug_core_1.logger.error('[chromeSpawnHelper] ' + data.toString());
            });
            chromeProc.stdout.on('data', data => {
                vscode_chrome_debug_core_1.logger.log('[chromeSpawnHelper] ' + data.toString());
            });
            return chromeProc;
        }
        else {
            vscode_chrome_debug_core_1.logger.log(`spawn('${chromePath}', ${JSON.stringify(chromeArgs)})`);
            const chromeProc = child_process_1.spawn(chromePath, chromeArgs, {
                detached: true,
                stdio: ['ignore'],
            });
            chromeProc.unref();
            return chromeProc;
        }
    }
}
ChromeDebugAdapter.PAGE_PAUSE_MESSAGE = 'Paused in Visual Studio Code';
exports.ChromeDebugAdapter = ChromeDebugAdapter;
function getSourceMapPathOverrides(webRoot, sourceMapPathOverrides) {
    return sourceMapPathOverrides ? resolveWebRootPattern(webRoot, sourceMapPathOverrides, /*warnOnMissing=*/ true) :
        resolveWebRootPattern(webRoot, DefaultWebSourceMapPathOverrides, /*warnOnMissing=*/ false);
}
/**
 * Returns a copy of sourceMapPathOverrides with the ${webRoot} pattern resolved in all entries.
 */
function resolveWebRootPattern(webRoot, sourceMapPathOverrides, warnOnMissing) {
    const resolvedOverrides = {};
    for (let pattern in sourceMapPathOverrides) {
        const replacePattern = sourceMapPathOverrides[pattern];
        resolvedOverrides[pattern] = replacePattern;
        const webRootIndex = replacePattern.indexOf('${webRoot}');
        if (webRootIndex === 0) {
            if (webRoot) {
                resolvedOverrides[pattern] = replacePattern.replace('${webRoot}', webRoot);
            }
            else if (warnOnMissing) {
                vscode_chrome_debug_core_1.logger.log('Warning: sourceMapPathOverrides entry contains ${webRoot}, but webRoot is not set');
            }
        }
        else if (webRootIndex > 0) {
            vscode_chrome_debug_core_1.logger.log('Warning: in a sourceMapPathOverrides entry, ${webRoot} is only valid at the beginning of the path');
        }
    }
    return resolvedOverrides;
}
exports.resolveWebRootPattern = resolveWebRootPattern;
function getChromeSpawnHelperPath() {
    if (path.basename(__dirname) === 'src') {
        // For tests
        return path.join(__dirname, '../chromeSpawnHelper.js');
    }
    else {
        return path.join(__dirname, 'chromeSpawnHelper.js');
    }
}
//# sourceMappingURL=chromeDebugAdapter.js.map