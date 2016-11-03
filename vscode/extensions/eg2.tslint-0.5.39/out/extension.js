"use strict";
var path = require('path');
var fs = require('fs');
var vscode_1 = require('vscode');
var vscode_languageclient_1 = require('vscode-languageclient');
var tslintConfig = [
    '{',
    '	"rules": {',
    '		"no-unused-expression": true,',
    '		"no-duplicate-variable": true,',
    '		"no-duplicate-key": true,',
    '		"no-unused-variable": true,',
    '		"curly": true,',
    '		"class-name": true,',
    '		"semicolon": ["always"],',
    '		"triple-equals": true',
    '	}',
    '}'
].join(process.platform === 'win32' ? '\r\n' : '\n');
var AllFixesRequest;
(function (AllFixesRequest) {
    AllFixesRequest.type = { get method() { return 'textDocument/tslint/allFixes'; } };
})(AllFixesRequest || (AllFixesRequest = {}));
var Status;
(function (Status) {
    Status[Status["ok"] = 1] = "ok";
    Status[Status["warn"] = 2] = "warn";
    Status[Status["error"] = 3] = "error";
})(Status || (Status = {}));
var StatusNotification;
(function (StatusNotification) {
    StatusNotification.type = { get method() { return 'tslint/status'; } };
})(StatusNotification || (StatusNotification = {}));
function activate(context) {
    var statusBarItem = vscode_1.window.createStatusBarItem(vscode_1.StatusBarAlignment.Right, 0);
    var tslintStatus = Status.ok;
    var serverRunning = false;
    statusBarItem.text = 'TSLint';
    statusBarItem.command = 'tslint.showOutputChannel';
    function showStatusBarItem(show) {
        if (show) {
            statusBarItem.show();
        }
        else {
            statusBarItem.hide();
        }
    }
    function updateStatus(status) {
        switch (status) {
            case Status.ok:
                statusBarItem.color = undefined;
                break;
            case Status.warn:
                statusBarItem.color = 'yellow';
                break;
            case Status.error:
                statusBarItem.color = 'yellow'; // darkred doesn't work
                break;
        }
        tslintStatus = status;
        udpateStatusBarVisibility(vscode_1.window.activeTextEditor);
    }
    function udpateStatusBarVisibility(editor) {
        //statusBarItem.text = tslintStatus === Status.ok ? 'TSLint' : 'TSLint!';
        switch (tslintStatus) {
            case Status.ok:
                statusBarItem.text = 'TSLint';
                break;
            case Status.warn:
                statusBarItem.text = 'TSLint: Warning';
                break;
            case Status.error:
                statusBarItem.text = 'TSLint: Error';
                break;
        }
        showStatusBarItem(serverRunning &&
            (tslintStatus !== Status.ok ||
                (editor && (editor.document.languageId === 'typescript' || editor.document.languageId === 'typescriptreact'))));
    }
    vscode_1.window.onDidChangeActiveTextEditor(udpateStatusBarVisibility);
    udpateStatusBarVisibility(vscode_1.window.activeTextEditor);
    // We need to go one level up since an extension compile the js code into
    // the output folder.
    var serverModulePath = path.join(__dirname, '..', 'server', 'server.js');
    // break on start options
    //let debugOptions = { execArgv: ["--nolazy", "--debug=6004", "--debug-brk"] };
    var debugOptions = { execArgv: ["--nolazy", "--debug=6004"] };
    var serverOptions = {
        run: { module: serverModulePath },
        debug: { module: serverModulePath, options: debugOptions }
    };
    var clientOptions = {
        documentSelector: ['typescript', 'typescriptreact'],
        synchronize: {
            configurationSection: 'tslint',
            fileEvents: vscode_1.workspace.createFileSystemWatcher('**/tslint.json')
        },
        diagnosticCollectionName: 'tslint',
        initializationOptions: function () {
            var configuration = vscode_1.workspace.getConfiguration('tslint');
            return {
                nodePath: configuration ? configuration.get('nodePath', undefined) : undefined
            };
        },
        initializationFailedHandler: function (error) {
            if (error instanceof vscode_languageclient_1.ResponseError) {
                var responseError = error;
                if (responseError.code === 99) {
                    if (vscode_1.workspace.rootPath) {
                        client.info([
                            'Failed to load the TSLint library.',
                            'To use TSLint in this workspace please install tslint using \'npm install tslint\' or globally using \'npm install -g tslint\'.',
                            'You need to reopen the workspace after installing tslint.',
                        ].join('\n'));
                    }
                    else {
                        client.info([
                            'Failed to load the TSLint library.',
                            'To use TSLint for single TypeScript files install tslint globally using \'npm install -g tslint\'.',
                            'You need to reopen VS Code after installing tslint.',
                        ].join('\n'));
                    }
                    // actively inform the user in the output channel
                    client.outputChannel.show();
                }
                else if (responseError.code === 100) {
                    // inform the user but do not show the output channel
                    client.info([
                        'Failed to load the TSLint library.',
                        'Ignoring the failure since there is no \'tslint.json\' file at the root of this workspace.',
                    ].join('\n'));
                }
            }
            else {
                client.error('Server initialization failed.', error);
                client.outputChannel.show();
            }
            return false;
        },
    };
    var client = new vscode_languageclient_1.LanguageClient('tslint', serverOptions, clientOptions);
    var running = 'Linter is running.';
    var stopped = 'Linter has stopped.';
    client.onDidChangeState(function (event) {
        if (event.newState === vscode_languageclient_1.State.Running) {
            client.info(running);
            statusBarItem.tooltip = running;
            serverRunning = true;
        }
        else {
            client.info(stopped);
            statusBarItem.tooltip = stopped;
            serverRunning = false;
        }
        udpateStatusBarVisibility(vscode_1.window.activeTextEditor);
    });
    client.onNotification(StatusNotification.type, function (params) {
        updateStatus(params.state);
    });
    function applyTextEdits(uri, documentVersion, edits) {
        var textEditor = vscode_1.window.activeTextEditor;
        if (textEditor && textEditor.document.uri.toString() === uri) {
            if (textEditor.document.version !== documentVersion) {
                vscode_1.window.showInformationMessage("TSLint fixes are outdated and can't be applied to the document.");
            }
            textEditor.edit(function (mutator) {
                for (var _i = 0, edits_1 = edits; _i < edits_1.length; _i++) {
                    var edit = edits_1[_i];
                    mutator.replace(vscode_languageclient_1.Protocol2Code.asRange(edit.range), edit.newText);
                }
            }).then(function (success) {
                if (!success) {
                    vscode_1.window.showErrorMessage('Failed to apply TSLint fixes to the document. Please consider opening an issue with steps to reproduce.');
                }
            });
        }
    }
    function fixAllProblems() {
        var textEditor = vscode_1.window.activeTextEditor;
        if (!textEditor) {
            return;
        }
        var uri = textEditor.document.uri.toString();
        client.sendRequest(AllFixesRequest.type, { textDocument: { uri: uri } }).then(function (result) {
            if (result) {
                applyTextEdits(uri, result.documentVersion, result.edits);
            }
        }, function (error) {
            vscode_1.window.showErrorMessage('Failed to apply TSLint fixes to the document. Please consider opening an issue with steps to reproduce.');
        });
    }
    function createDefaultConfiguration() {
        if (!vscode_1.workspace.rootPath) {
            vscode_1.window.showErrorMessage('A TSLint configuration file can only be generated if VS Code is opened on a folder.');
        }
        var tslintConfigFile = path.join(vscode_1.workspace.rootPath, 'tslint.json');
        if (fs.existsSync(tslintConfigFile)) {
            vscode_1.window.showInformationMessage('A TSLint configuration file already exists.');
        }
        else {
            fs.writeFileSync(tslintConfigFile, tslintConfig, { encoding: 'utf8' });
        }
    }
    context.subscriptions.push(new vscode_languageclient_1.SettingMonitor(client, 'tslint.enable').start(), vscode_1.commands.registerCommand('tslint.applySingleFix', applyTextEdits), vscode_1.commands.registerCommand('tslint.applySameFixes', applyTextEdits), vscode_1.commands.registerCommand('tslint.applyAllFixes', applyTextEdits), vscode_1.commands.registerCommand('tslint.fixAllProblems', fixAllProblems), vscode_1.commands.registerCommand('tslint.createConfig', createDefaultConfiguration), vscode_1.commands.registerCommand('tslint.showOutputChannel', function () { client.outputChannel.show(); }), statusBarItem);
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map