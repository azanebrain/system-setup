"use strict";
// Portions of this file are under APACHE 2.0 license.
// See APACHE.txt in this projects root diretory for details.
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// Portions of this file are under the MIT license
// See LICENSE in this projects root directory for details.
// This is a copy and adaptation of the ProjectServer from
// TypeScript's editorServices.ts copied and adapted under
// the APACHE 2.0 license. Some utility functions and
// TypeScript were also lifted.
var path = require("path");
var fs = require("fs");
var ts = require("typescript");
var ng = require("@angular/language-service");
var lineCollectionCapacity = 4;
function toPath(fileName, currentDirectory, getCanonicalFileName) {
    return fileName;
}
var hasOwnProperty = Object.prototype.hasOwnProperty;
function createMap(template) {
    var map = Object.create(null); // tslint:disable-line:no-null-keyword
    // Using 'delete' on an object causes V8 to put the object in dictionary mode.
    // This disables creation of hidden classes, which are expensive when an object is
    // constantly changing shape.
    map["__"] = undefined;
    delete map["__"];
    // Copies keys/values from template. Note that for..in will not throw if
    // template is undefined, and instead will just exit the loop.
    for (var key in template)
        if (hasOwnProperty.call(template, key)) {
            map[key] = template[key];
        }
    return map;
}
function lastOrUndefined(array) {
    if (array.length === 0) {
        return undefined;
    }
    return array[array.length - 1];
}
var directorySeparator = "/";
function getNormalizedParts(normalizedSlashedPath, rootLength) {
    var parts = normalizedSlashedPath.substr(rootLength).split(directorySeparator);
    var normalized = [];
    for (var _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
        var part = parts_1[_i];
        if (part !== ".") {
            if (part === ".." && normalized.length > 0 && lastOrUndefined(normalized) !== "..") {
                normalized.pop();
            }
            else {
                // A part may be an empty string (which is 'falsy') if the path had consecutive slashes,
                // e.g. "path//file.ts".  Drop these before re-joining the parts.
                if (part) {
                    normalized.push(part);
                }
            }
        }
    }
    return normalized;
}
// Returns length of path root (i.e. length of "/", "x:/", "//server/share/, file:///user/files")
function getRootLength(path) {
    if (path.charCodeAt(0) === 0x2F) {
        if (path.charCodeAt(1) !== 0x2F)
            return 1;
        var p1 = path.indexOf("/", 2);
        if (p1 < 0)
            return 2;
        var p2 = path.indexOf("/", p1 + 1);
        if (p2 < 0)
            return p1 + 1;
        return p2 + 1;
    }
    if (path.charCodeAt(1) === 0x3A) {
        if (path.charCodeAt(2) === 0x2F)
            return 3;
        return 2;
    }
    // Per RFC 1738 'file' URI schema has the shape file://<host>/<path>
    // if <host> is omitted then it is assumed that host value is 'localhost',
    // however slash after the omitted <host> is not removed.
    // file:///folder1/file1 - this is a correct URI
    // file://folder2/file2 - this is an incorrect URI
    if (path.lastIndexOf("file:///", 0) === 0) {
        return "file:///".length;
    }
    var idx = path.indexOf("://");
    if (idx !== -1) {
        return idx + "://".length;
    }
    return 0;
}
function getDirectoryPath(path) {
    return path.substr(0, Math.max(getRootLength(path), path.lastIndexOf(directorySeparator)));
}
function normalizeSlashes(path) {
    return path.replace(/\\/g, "/");
}
function normalizePath(path) {
    path = normalizeSlashes(path);
    var rootLength = getRootLength(path);
    var normalized = getNormalizedParts(path, rootLength);
    return path.substr(0, rootLength) + normalized.join(directorySeparator);
}
function combinePaths(path1, path2) {
    if (!(path1 && path1.length))
        return path2;
    if (!(path2 && path2.length))
        return path1;
    if (getRootLength(path2) !== 0)
        return path2;
    if (path1.charAt(path1.length - 1) === directorySeparator)
        return path1 + path2;
    return path1 + directorySeparator + path2;
}
function getScriptKindFromFileName(fileName) {
    var ext = fileName.substr(fileName.lastIndexOf("."));
    switch (ext.toLowerCase()) {
        case ".js":
            return ts.ScriptKind.JS;
        case ".jsx":
            return ts.ScriptKind.JSX;
        case ".ts":
            return ts.ScriptKind.TS;
        case ".tsx":
            return ts.ScriptKind.TSX;
        default:
            return ts.ScriptKind.Unknown;
    }
}
function addRange(to, from) {
    if (to && from) {
        for (var _i = 0, from_1 = from; _i < from_1.length; _i++) {
            var v = from_1[_i];
            to.push(v);
        }
    }
}
function forEachProperty(map, callback) {
    var result;
    for (var key in map) {
        if (result = callback(map[key], key))
            break;
    }
    return result;
}
function concatenate(array1, array2) {
    if (!array2 || !array2.length)
        return array1;
    if (!array1 || !array1.length)
        return array2;
    return array1.concat(array2);
}
function deduplicate(array, areEqual) {
    var result;
    if (array) {
        result = [];
        loop: for (var _i = 0, array_1 = array; _i < array_1.length; _i++) {
            var item = array_1[_i];
            for (var _a = 0, result_1 = result; _a < result_1.length; _a++) {
                var res = result_1[_a];
                if (areEqual ? areEqual(res, item) : res === item) {
                    continue loop;
                }
            }
            result.push(item);
        }
    }
    return result;
}
function clone(object) {
    var result = {};
    for (var id in object) {
        if (hasOwnProperty.call(object, id)) {
            result[id] = object[id];
        }
    }
    return result;
}
/**
 *  List of supported extensions in order of file resolution precedence.
 */
var supportedTypeScriptExtensions = [".ts", ".tsx", ".d.ts"];
/** Must have ".d.ts" first because if ".ts" goes first, that will be detected as the extension instead of ".d.ts". */
var supportedTypescriptExtensionsForExtractExtension = [".d.ts", ".ts", ".tsx"];
var supportedJavascriptExtensions = [".js", ".jsx"];
var allSupportedExtensions = supportedTypeScriptExtensions.concat(supportedJavascriptExtensions);
function getSupportedExtensions(options) {
    return options && options.allowJs ? allSupportedExtensions : supportedTypeScriptExtensions;
}
function isSupportedSourceFileName(fileName, compilerOptions) {
    if (!fileName) {
        return false;
    }
    for (var _i = 0, _a = getSupportedExtensions(compilerOptions); _i < _a.length; _i++) {
        var extension = _a[_i];
        if (fileExtensionIs(fileName, extension)) {
            return true;
        }
    }
    return false;
}
function fileExtensionIs(path, extension) {
    return path.length > extension.length && endsWith(path, extension);
}
function endsWith(str, suffix) {
    var expectedPos = str.length - suffix.length;
    return expectedPos >= 0 && str.indexOf(suffix, expectedPos) === expectedPos;
}
function arrayIsEqualTo(array1, array2, equaler) {
    if (!array1 || !array2) {
        return array1 === array2;
    }
    if (array1.length !== array2.length) {
        return false;
    }
    for (var i = 0; i < array1.length; i++) {
        var equals = equaler ? equaler(array1[i], array2[i]) : array1[i] === array2[i];
        if (!equals) {
            return false;
        }
    }
    return true;
}
function getBaseFileName(path) {
    if (path === undefined) {
        return undefined;
    }
    var i = path.lastIndexOf(directorySeparator);
    return i < 0 ? path : path.substring(i + 1);
}
function parseAndReEmitConfigJSONFile(content) {
    var options = {
        fileName: "config.js",
        compilerOptions: {
            target: ts.ScriptTarget.Latest,
            removeComments: true
        },
        reportDiagnostics: true
    };
    var _a = ts.transpileModule("(" + content + ")", options), outputText = _a.outputText, diagnostics = _a.diagnostics;
    // Becasue the content was wrapped in "()", the start position of diagnostics needs to be subtract by 1
    // also, the emitted result will have "(" in the beginning and ");" in the end. We need to strip these
    // as well
    var trimmedOutput = outputText.trim();
    var configJsonObject = JSON.parse(trimmedOutput.substring(1, trimmedOutput.length - 2));
    for (var _i = 0, diagnostics_1 = diagnostics; _i < diagnostics_1.length; _i++) {
        var diagnostic = diagnostics_1[_i];
        diagnostic.start = diagnostic.start - 1;
    }
    return { configJsonObject: configJsonObject, diagnostics: diagnostics };
}
exports.parseAndReEmitConfigJSONFile = parseAndReEmitConfigJSONFile;
function reduceProperties(map, callback, initial) {
    var result = initial;
    for (var key in map) {
        result = callback(result, map[key], String(key));
    }
    return result;
}
function removeTrailingDirectorySeparator(path) {
    if (path.charAt(path.length - 1) === directorySeparator) {
        return path.substr(0, path.length - 1);
    }
    return path;
}
function normalizedPathComponents(path, rootLength) {
    var normalizedParts = getNormalizedParts(path, rootLength);
    return [path.substr(0, rootLength)].concat(normalizedParts);
}
function getNormalizedPathComponents(path, currentDirectory) {
    path = normalizeSlashes(path);
    var rootLength = getRootLength(path);
    if (rootLength === 0) {
        // If the path is not rooted it is relative to current directory
        path = combinePaths(normalizeSlashes(currentDirectory), path);
        rootLength = getRootLength(path);
    }
    return normalizedPathComponents(path, rootLength);
}
function compareValues(a, b) {
    if (a === b)
        return 0 /* EqualTo */;
    if (a === undefined)
        return -1 /* LessThan */;
    if (b === undefined)
        return 1 /* GreaterThan */;
    return a < b ? -1 /* LessThan */ : 1 /* GreaterThan */;
}
function compareStrings(a, b, ignoreCase) {
    if (a === b)
        return 0 /* EqualTo */;
    if (a === undefined)
        return -1 /* LessThan */;
    if (b === undefined)
        return 1 /* GreaterThan */;
    if (ignoreCase) {
        if (String.prototype.localeCompare) {
            var result = a.localeCompare(b, /*locales*/ undefined, { usage: "sort", sensitivity: "accent" });
            return result < 0 ? -1 /* LessThan */ : result > 0 ? 1 /* GreaterThan */ : 0 /* EqualTo */;
        }
        a = a.toUpperCase();
        b = b.toUpperCase();
        if (a === b)
            return 0 /* EqualTo */;
    }
    return a < b ? -1 /* LessThan */ : 1 /* GreaterThan */;
}
function comparePaths(a, b, currentDirectory, ignoreCase) {
    if (a === b)
        return 0 /* EqualTo */;
    if (a === undefined)
        return -1 /* LessThan */;
    if (b === undefined)
        return 1 /* GreaterThan */;
    a = removeTrailingDirectorySeparator(a);
    b = removeTrailingDirectorySeparator(b);
    var aComponents = getNormalizedPathComponents(a, currentDirectory);
    var bComponents = getNormalizedPathComponents(b, currentDirectory);
    var sharedLength = Math.min(aComponents.length, bComponents.length);
    for (var i = 0; i < sharedLength; i++) {
        var result = compareStrings(aComponents[i], bComponents[i], ignoreCase);
        if (result !== 0 /* EqualTo */) {
            return result;
        }
    }
    return compareValues(aComponents.length, bComponents.length);
}
function filter(array, f) {
    if (array) {
        var len = array.length;
        var i = 0;
        while (i < len && f(array[i]))
            i++;
        if (i < len) {
            var result = array.slice(0, i);
            i++;
            while (i < len) {
                var item = array[i];
                if (f(item)) {
                    result.push(item);
                }
                i++;
            }
            return result;
        }
    }
    return array;
}
function computeLineStarts(text) {
    var result = new Array();
    var pos = 0;
    var lineStart = 0;
    while (pos < text.length) {
        var ch = text.charCodeAt(pos);
        pos++;
        switch (ch) {
            case 0x0D:
                if (text.charCodeAt(pos) === 0x0A) {
                    pos++;
                }
            case 0x0A:
            case 0x2028:
            case 0x2029:
                result.push(lineStart);
                lineStart = pos;
                break;
        }
    }
    result.push(lineStart);
    return result;
}
function createGetCanonicalFileName(useCaseSensitivefileNames) {
    return useCaseSensitivefileNames
        ? (function (fileName) { return fileName; })
        : (function (fileName) { return fileName.toLowerCase(); });
}
var ScriptInfo = (function () {
    function ScriptInfo(host, fileName, content, isOpen) {
        if (isOpen === void 0) { isOpen = false; }
        this.host = host;
        this.fileName = fileName;
        this.isOpen = isOpen;
        this.children = []; // files referenced by this file
        this.path = toPath(fileName, host.getCurrentDirectory(), createGetCanonicalFileName(host.useCaseSensitiveFileNames));
        this.svc = ScriptVersionCache.fromString(host, content);
    }
    // setFormatOptions(formatOptions: protocol.FormatOptions): void {
    //     if (formatOptions) {
    //         mergeFormatOptions(this.formatCodeOptions, formatOptions);
    //     }
    // }
    ScriptInfo.prototype.close = function () {
        this.isOpen = false;
    };
    ScriptInfo.prototype.addChild = function (childInfo) {
        this.children.push(childInfo);
    };
    ScriptInfo.prototype.snap = function () {
        return this.svc.getSnapshot();
    };
    ScriptInfo.prototype.getText = function () {
        var snap = this.snap();
        return snap.getText(0, snap.getLength());
    };
    ScriptInfo.prototype.getLineInfo = function (line) {
        var snap = this.snap();
        return snap.index.lineNumberToInfo(line);
    };
    ScriptInfo.prototype.editContent = function (start, end, newText) {
        this.svc.edit(start, end - start, newText);
    };
    ScriptInfo.prototype.getTextChangeRangeBetweenVersions = function (startVersion, endVersion) {
        return this.svc.getTextChangesBetweenVersions(startVersion, endVersion);
    };
    ScriptInfo.prototype.getChangeRange = function (oldSnapshot) {
        return this.snap().getChangeRange(oldSnapshot);
    };
    return ScriptInfo;
}());
exports.ScriptInfo = ScriptInfo;
var LSHost = (function () {
    function LSHost(host, project) {
        var _this = this;
        this.host = host;
        this.project = project;
        this.roots = [];
        this.version = 0;
        this.getCanonicalFileName = createGetCanonicalFileName(host.useCaseSensitiveFileNames);
        this.resolvedModuleNames = new Map();
        this.resolvedTypeReferenceDirectives = new Map();
        this.filenameToScript = new Map();
        this.moduleResolutionHost = {
            fileExists: function (fileName) { return _this.fileExists(fileName); },
            readFile: function (fileName) { return _this.host.readFile(fileName); },
            directoryExists: function (directoryName) { return _this.host.directoryExists(directoryName); }
        };
        //   if (this.host.realpath) {
        //       this.moduleResolutionHost.realpath = path => this.host.realpath(path);
        //   }
    }
    LSHost.prototype.resolveNamesWithLocalCache = function (names, containingFile, cache, loader, getResult) {
        var path = toPath(containingFile, this.host.getCurrentDirectory(), this.getCanonicalFileName);
        var currentResolutionsInFile = cache.get(path);
        var newResolutions = createMap();
        var resolvedModules = [];
        var compilerOptions = this.getCompilationSettings();
        for (var _i = 0, names_1 = names; _i < names_1.length; _i++) {
            var name_1 = names_1[_i];
            // check if this is a duplicate entry in the list
            var resolution = newResolutions[name_1];
            if (!resolution) {
                var existingResolution = currentResolutionsInFile && currentResolutionsInFile[name_1];
                if (moduleResolutionIsValid(existingResolution)) {
                    // ok, it is safe to use existing name resolution results
                    resolution = existingResolution;
                }
                else {
                    resolution = loader(name_1, containingFile, compilerOptions, this.moduleResolutionHost);
                    resolution.lastCheckTime = Date.now();
                    newResolutions[name_1] = resolution;
                }
            }
            resolvedModules.push(getResult(resolution));
        }
        // replace old results with a new one
        cache.set(path, newResolutions);
        return resolvedModules;
        function moduleResolutionIsValid(resolution) {
            if (!resolution) {
                return false;
            }
            if (getResult(resolution)) {
                // TODO: consider checking failedLookupLocations
                // TODO: use lastCheckTime to track expiration for module name resolution
                return true;
            }
            // consider situation if we have no candidate locations as valid resolution.
            // after all there is no point to invalidate it if we have no idea where to look for the module.
            if (resolution.failedLookupLocations === undefined) {
                return true;
            }
            return resolution.failedLookupLocations.length === 0;
        }
    };
    LSHost.prototype.getProjectVersion = function () {
        return this.version.toString();
    };
    LSHost.prototype.resolveTypeReferenceDirectives = function (typeDirectiveNames, containingFile) {
        return this.resolveNamesWithLocalCache(typeDirectiveNames, containingFile, this.resolvedTypeReferenceDirectives, ts.resolveTypeReferenceDirective, function (m) { return m.resolvedTypeReferenceDirective; });
    };
    LSHost.prototype.resolveModuleNames = function (moduleNames, containingFile) {
        return this.resolveNamesWithLocalCache(moduleNames, containingFile, this.resolvedModuleNames, ts.resolveModuleName, function (m) { return m.resolvedModule; });
    };
    LSHost.prototype.getDefaultLibFileName = function () {
        var nodeModuleBinDir = getDirectoryPath(normalizePath(this.host.getExecutingFilePath()));
        return combinePaths(nodeModuleBinDir, ts.getDefaultLibFileName(this.compilationSettings));
    };
    LSHost.prototype.getScriptSnapshot = function (filename) {
        var scriptInfo = this.getScriptInfo(filename);
        if (scriptInfo) {
            return scriptInfo.snap();
        }
    };
    LSHost.prototype.setCompilationSettings = function (opt) {
        this.compilationSettings = opt;
        // conservatively assume that changing compiler options might affect module resolution strategy
        this.resolvedModuleNames.clear();
        this.resolvedTypeReferenceDirectives.clear();
        this.modified();
    };
    LSHost.prototype.lineAffectsRefs = function (filename, line) {
        var info = this.getScriptInfo(filename);
        var lineInfo = info.getLineInfo(line);
        if (lineInfo && lineInfo.text) {
            var regex = /reference|import|\/\*|\*\//;
            return regex.test(lineInfo.text);
        }
    };
    LSHost.prototype.getCompilationSettings = function () {
        // change this to return active project settings for file
        return this.compilationSettings;
    };
    LSHost.prototype.getScriptFileNames = function () {
        return this.roots.map(function (root) { return root.fileName; });
    };
    LSHost.prototype.getScriptKind = function (fileName) {
        var info = this.getScriptInfo(fileName);
        if (!info) {
            return undefined;
        }
        if (!info.scriptKind) {
            info.scriptKind = getScriptKindFromFileName(fileName);
        }
        return info.scriptKind;
    };
    LSHost.prototype.getScriptVersion = function (filename) {
        var info = this.getScriptInfo(filename);
        if (info) {
            return info.svc.latestVersion().toString();
        }
        return "<unknown>";
    };
    LSHost.prototype.getCurrentDirectory = function () {
        return "";
    };
    LSHost.prototype.getScriptIsOpen = function (filename) {
        return this.getScriptInfo(filename).isOpen;
    };
    LSHost.prototype.removeReferencedFile = function (info) {
        if (!info.isOpen) {
            this.filenameToScript.delete(info.path);
            this.resolvedModuleNames.delete(info.path);
            this.resolvedTypeReferenceDirectives.delete(info.path);
            this.modified();
        }
    };
    LSHost.prototype.getScriptInfo = function (filename) {
        var path = toPath(filename, this.host.getCurrentDirectory(), this.getCanonicalFileName);
        var scriptInfo = this.filenameToScript.get(path);
        if (!scriptInfo) {
            scriptInfo = this.project.openReferencedFile(filename);
            if (scriptInfo) {
                this.filenameToScript.set(path, scriptInfo);
            }
        }
        return scriptInfo;
    };
    LSHost.prototype.addRoot = function (info) {
        if (!this.filenameToScript.has(info.path)) {
            this.filenameToScript.set(info.path, info);
            this.roots.push(info);
            this.modified();
        }
    };
    LSHost.prototype.removeRoot = function (info) {
        if (this.filenameToScript.has(info.path)) {
            this.filenameToScript.delete(info.path);
            this.roots = copyListRemovingItem(info, this.roots);
            this.resolvedModuleNames.delete(info.path);
            this.resolvedTypeReferenceDirectives.delete(info.path);
            this.modified();
        }
    };
    //   saveTo(filename: string, tmpfilename: string) {
    //       const script = this.getScriptInfo(filename);
    //       if (script) {
    //           const snap = script.snap();
    //           this.host.writeFile(tmpfilename, snap.getText(0, snap.getLength()));
    //       }
    //   }
    LSHost.prototype.reloadScript = function (filename, tmpfilename, cb) {
        var script = this.getScriptInfo(filename);
        if (script) {
            script.svc.reloadFromFile(tmpfilename, cb);
            this.modified();
        }
    };
    LSHost.prototype.editScript = function (filename, start, end, newText) {
        var script = this.getScriptInfo(filename);
        if (script) {
            script.editContent(start, end, newText);
            this.modified();
            return;
        }
        throw new Error("No script with name '" + filename + "'");
    };
    LSHost.prototype.resolvePath = function (path) {
        var result = this.host.resolvePath(path);
        return result;
    };
    LSHost.prototype.fileExists = function (path) {
        var result = this.host.fileExists(path);
        return result;
    };
    LSHost.prototype.directoryExists = function (path) {
        return this.host.directoryExists(path);
    };
    LSHost.prototype.getDirectories = function (path) {
        return this.host.getDirectories(path);
    };
    /**
     *  @param line 1 based index
     */
    LSHost.prototype.lineToTextSpan = function (filename, line) {
        var path = toPath(filename, this.host.getCurrentDirectory(), this.getCanonicalFileName);
        var script = this.filenameToScript.get(path);
        var index = script.snap().index;
        var lineInfo = index.lineNumberToInfo(line + 1);
        var len;
        if (lineInfo.leaf) {
            len = lineInfo.leaf.text.length;
        }
        else {
            var nextLineInfo = index.lineNumberToInfo(line + 2);
            len = nextLineInfo.offset - lineInfo.offset;
        }
        return ts.createTextSpan(lineInfo.offset, len);
    };
    /**
     * @param line 1 based index
     * @param offset 1 based index
     */
    LSHost.prototype.lineOffsetToPosition = function (filename, line, offset) {
        var path = toPath(filename, this.host.getCurrentDirectory(), this.getCanonicalFileName);
        var script = this.getScriptInfo(path);
        var index = script.snap().index;
        var lineInfo = index.lineNumberToInfo(line);
        // TODO: assert this offset is actually on the line
        return (lineInfo.offset + offset - 1);
    };
    /**
     * @param line 1-based index
     * @param offset 1-based index
     */
    LSHost.prototype.positionToLineOffset = function (filename, position, lineIndex) {
        lineIndex = lineIndex || this.getLineIndex(filename);
        var lineOffset = lineIndex.charOffsetToLineNumberAndPos(position);
        return { line: lineOffset.line, offset: lineOffset.offset + 1, text: lineOffset.text };
    };
    LSHost.prototype.getLineIndex = function (filename) {
        var path = toPath(filename, this.host.getCurrentDirectory(), this.getCanonicalFileName);
        var script = this.filenameToScript.get(path);
        return script.snap().index;
    };
    LSHost.prototype.modified = function () {
        this.version++;
    };
    return LSHost;
}());
exports.LSHost = LSHost;
var Project = (function () {
    function Project(projectService, logger, projectOptions, languageServiceDiabled) {
        if (languageServiceDiabled === void 0) { languageServiceDiabled = false; }
        this.projectService = projectService;
        this.logger = logger;
        this.projectOptions = projectOptions;
        this.languageServiceDiabled = languageServiceDiabled;
        // Used to keep track of what directories are watched for this project
        this.directoriesWatchedForTsconfig = [];
        this.filenameToSourceFile = createMap();
        this.referencesFile = new Set();
        this.updateGraphSeq = 0;
        /** Used for configured projects which may have multiple open roots */
        this.openRefCount = 0;
        if (projectOptions && projectOptions.files) {
            // If files are listed explicitly, allow all extensions
            projectOptions.compilerOptions['allowNonTsExtensions'] = true;
        }
        if (!languageServiceDiabled) {
            this.compilerService = new CompilerService(this, logger, projectOptions && projectOptions.compilerOptions);
        }
    }
    Project.prototype.enableLanguageService = function () {
        // if the language service was disabled, we should re-initiate the compiler service
        if (this.languageServiceDiabled) {
            this.compilerService = new CompilerService(this, this.logger, this.projectOptions && this.projectOptions.compilerOptions);
        }
        this.languageServiceDiabled = false;
    };
    Project.prototype.disableLanguageService = function () {
        this.languageServiceDiabled = true;
    };
    Project.prototype.addOpenRef = function () {
        this.openRefCount++;
    };
    Project.prototype.deleteOpenRef = function () {
        this.openRefCount--;
        return this.openRefCount;
    };
    Project.prototype.openReferencedFile = function (filename) {
        return this.projectService.openFile(filename, /*openedByClient*/ false);
    };
    Project.prototype.getRootFiles = function () {
        if (this.languageServiceDiabled) {
            // When the languageService was disabled, only return file list if it is a configured project
            return this.projectOptions ? this.projectOptions.files : undefined;
        }
        return this.compilerService.host.roots.map(function (info) { return info.fileName; });
    };
    Project.prototype.getFileNames = function () {
        if (this.languageServiceDiabled) {
            if (!this.projectOptions) {
                return undefined;
            }
            var fileNames = [];
            if (this.projectOptions && this.projectOptions.compilerOptions) {
                fileNames.push(ts.getDefaultLibFilePath(this.projectOptions.compilerOptions));
            }
            addRange(fileNames, this.projectOptions.files);
            return fileNames;
        }
        var sourceFiles = this.program.getSourceFiles();
        return sourceFiles.map(function (sourceFile) { return sourceFile.fileName; });
    };
    Project.prototype.references = function (info) {
        if (this.languageServiceDiabled) {
            return undefined;
        }
        return this.referencesFile.has(info.fileName);
    };
    Project.prototype.getSourceFile = function (info) {
        if (this.languageServiceDiabled) {
            return undefined;
        }
        return this.filenameToSourceFile[info.fileName];
    };
    Project.prototype.getSourceFileFromName = function (filename, requireOpen) {
        if (this.languageServiceDiabled) {
            return undefined;
        }
        var info = this.projectService.getScriptInfo(filename);
        if (info) {
            if ((!requireOpen) || info.isOpen) {
                return this.getSourceFile(info);
            }
        }
    };
    Project.prototype.isRoot = function (info) {
        if (this.languageServiceDiabled) {
            return undefined;
        }
        return this.compilerService.host.roots.some(function (root) { return root === info; });
    };
    Project.prototype.removeReferencedFile = function (info) {
        if (this.languageServiceDiabled) {
            return;
        }
        this.compilerService.host.removeReferencedFile(info);
        this.updateGraph();
    };
    Project.prototype.updateFileMap = function () {
        if (this.languageServiceDiabled) {
            return;
        }
        this.filenameToSourceFile = createMap();
        this.referencesFile = new Set();
        // Update all references to TypeScript files
        var sourceFiles = this.program.getSourceFiles();
        for (var i = 0, len = sourceFiles.length; i < len; i++) {
            var normFilename = normalizePath(sourceFiles[i].fileName);
            this.filenameToSourceFile[normFilename] = sourceFiles[i];
            this.referencesFile.add(normFilename);
        }
        // Update all referenced angular templates
        for (var _i = 0, _a = this.compilerService.ngService.getTemplateReferences(); _i < _a.length; _i++) {
            var template = _a[_i];
            var normFilename = normalizePath(template);
            this.referencesFile.add(normFilename);
        }
    };
    Project.prototype.finishGraph = function () {
        if (this.languageServiceDiabled) {
            return;
        }
        this.updateGraph();
        this.compilerService.languageService.getNavigateToItems(".*");
    };
    Project.prototype.updateGraph = function () {
        if (this.languageServiceDiabled) {
            return;
        }
        this.program = this.compilerService.languageService.getProgram();
        this.updateFileMap();
    };
    Project.prototype.isConfiguredProject = function () {
        return this.projectFilename;
    };
    // add a root file to project
    Project.prototype.addRoot = function (info) {
        if (this.languageServiceDiabled) {
            return;
        }
        this.compilerService.host.addRoot(info);
    };
    // remove a root file from project
    Project.prototype.removeRoot = function (info) {
        if (this.languageServiceDiabled) {
            return;
        }
        this.compilerService.host.removeRoot(info);
    };
    Project.prototype.filesToString = function () {
        if (this.languageServiceDiabled) {
            if (this.projectOptions) {
                var strBuilder_1 = "";
                this.projectOptions.files.forEach(function (file) { strBuilder_1 += file + "\n"; });
                return strBuilder_1;
            }
        }
        var strBuilder = "";
        forEachProperty(this.filenameToSourceFile, function (sourceFile) { strBuilder += sourceFile.fileName + "\n"; });
        return strBuilder;
    };
    Project.prototype.setProjectOptions = function (projectOptions) {
        this.projectOptions = projectOptions;
        if (projectOptions.compilerOptions) {
            projectOptions.compilerOptions['allowNonTsExtensions'] = true;
            if (!this.languageServiceDiabled) {
                this.compilerService.setCompilerOptions(projectOptions.compilerOptions);
            }
        }
    };
    return Project;
}());
exports.Project = Project;
function copyListRemovingItem(item, list) {
    var copiedList = [];
    for (var i = 0, len = list.length; i < len; i++) {
        if (list[i] != item) {
            copiedList.push(list[i]);
        }
    }
    return copiedList;
}
/**
 * This helper funciton processes a list of projects and return the concatenated, sortd and deduplicated output of processing each project.
 */
function combineProjectOutput(projects, action, comparer, areEqual) {
    var result = projects.reduce(function (previous, current) { return concatenate(previous, action(current)); }, []).sort(comparer);
    return projects.length > 1 ? deduplicate(result, areEqual) : result;
}
exports.combineProjectOutput = combineProjectOutput;
var ProjectService = (function () {
    function ProjectService(host, psLogger, eventHandler) {
        this.host = host;
        this.psLogger = psLogger;
        this.eventHandler = eventHandler;
        this.filenameToScriptInfo = createMap();
        // open, non-configured root files
        this.openFileRoots = [];
        // projects built from openFileRoots
        this.inferredProjects = [];
        // projects specified by a tsconfig.json file
        this.configuredProjects = [];
        // open files referenced by a project
        this.openFilesReferenced = [];
        // open files that are roots of a configured project
        this.openFileRootsConfigured = [];
        // a path to directory watcher map that detects added tsconfig files
        this.directoryWatchersForTsconfig = createMap();
        // count of how many projects are using the directory watcher. If the
        // number becomes 0 for a watcher, then we should close it.
        this.directoryWatchersRefCount = createMap();
        this.timerForDetectingProjectFileListChanges = createMap();
        this.changeSeq = 0;
        // ts.disableIncrementalParsing = true;
        this.addDefaultHostConfiguration();
    }
    ProjectService.prototype.addDefaultHostConfiguration = function () {
        this.hostConfiguration = {
            formatCodeOptions: clone(CompilerService.getDefaultFormatCodeOptions(this.host)),
            hostInfo: "Unknown host"
        };
    };
    ProjectService.prototype.watchedFileChanged = function (fileName) {
        var info = this.filenameToScriptInfo[fileName];
        if (!info) {
            this.psLogger.info("Error: got watch notification for unknown file: " + fileName);
        }
        if (!this.host.fileExists(fileName)) {
            // File was deleted
            this.fileDeletedInFilesystem(info);
        }
        else {
            if (info && (!info.isOpen)) {
                info.svc.reloadFromFile(info.fileName);
            }
        }
    };
    ProjectService.prototype.report = function (eventName, fileName, project) {
        if (this.eventHandler) {
            this.eventHandler({ eventName: eventName, data: { project: project, fileName: fileName } });
        }
    };
    /**
     * This is the callback function when a watched directory has added or removed source code files.
     * @param project the project that associates with this directory watcher
     * @param fileName the absolute file name that changed in watched directory
     */
    ProjectService.prototype.directoryWatchedForSourceFilesChanged = function (project, fileName) {
        // If a change was made inside "folder/file", node will trigger the callback twice:
        // one with the fileName being "folder/file", and the other one with "folder".
        // We don't respond to the second one.
        if (fileName && !isSupportedSourceFileName(fileName, project.projectOptions ? project.projectOptions.compilerOptions : undefined)) {
            return;
        }
        this.log("Detected source file changes: " + fileName);
        this.startTimerForDetectingProjectFileListChanges(project);
    };
    ProjectService.prototype.startTimerForDetectingProjectFileListChanges = function (project) {
        var _this = this;
        if (this.timerForDetectingProjectFileListChanges[project.projectFilename]) {
            this.host.clearTimeout(this.timerForDetectingProjectFileListChanges[project.projectFilename]);
        }
        this.timerForDetectingProjectFileListChanges[project.projectFilename] = this.host.setTimeout(function () { return _this.handleProjectFileListChanges(project); }, 250);
    };
    ProjectService.prototype.handleProjectFileListChanges = function (project) {
        var _this = this;
        var _a = this.configFileToProjectOptions(project.projectFilename), projectOptions = _a.projectOptions, errors = _a.errors;
        this.reportConfigFileDiagnostics(project.projectFilename, errors);
        var newRootFiles = projectOptions.files.map((function (f) { return _this.getCanonicalFileName(f); }));
        var currentRootFiles = project.getRootFiles().map((function (f) { return _this.getCanonicalFileName(f); }));
        // We check if the project file list has changed. If so, we update the project.
        if (!arrayIsEqualTo(currentRootFiles && currentRootFiles.sort(), newRootFiles && newRootFiles.sort())) {
            // For configured projects, the change is made outside the tsconfig file, and
            // it is not likely to affect the project for other files opened by the client. We can
            // just update the current project.
            this.updateConfiguredProject(project);
            // Call updateProjectStructure to clean up inferred projects we may have
            // created for the new files
            this.updateProjectStructure();
        }
    };
    ProjectService.prototype.reportConfigFileDiagnostics = function (configFileName, diagnostics, triggerFile) {
        if (diagnostics && diagnostics.length > 0 && this.eventHandler) {
            this.eventHandler({
                eventName: "configFileDiag",
                data: { configFileName: configFileName, diagnostics: diagnostics, triggerFile: triggerFile }
            });
        }
    };
    /**
     * This is the callback function when a watched directory has an added tsconfig file.
     */
    ProjectService.prototype.directoryWatchedForTsconfigChanged = function (fileName) {
        var _this = this;
        if (getBaseFileName(fileName) !== "tsconfig.json") {
            this.log(fileName + " is not tsconfig.json");
            return;
        }
        this.log("Detected newly added tsconfig file: " + fileName);
        var _a = this.configFileToProjectOptions(fileName), projectOptions = _a.projectOptions, errors = _a.errors;
        this.reportConfigFileDiagnostics(fileName, errors);
        if (!projectOptions) {
            return;
        }
        var rootFilesInTsconfig = projectOptions.files.map(function (f) { return _this.getCanonicalFileName(f); });
        var openFileRoots = this.openFileRoots.map(function (s) { return _this.getCanonicalFileName(s.fileName); });
        // We should only care about the new tsconfig file if it contains any
        // opened root files of existing inferred projects
        for (var _i = 0, openFileRoots_1 = openFileRoots; _i < openFileRoots_1.length; _i++) {
            var openFileRoot = openFileRoots_1[_i];
            if (rootFilesInTsconfig.indexOf(openFileRoot) >= 0) {
                this.reloadProjects();
                return;
            }
        }
    };
    ProjectService.prototype.getCanonicalFileName = function (fileName) {
        var name = this.host.useCaseSensitiveFileNames ? fileName : fileName.toLowerCase();
        return normalizePath(name);
    };
    ProjectService.prototype.watchedProjectConfigFileChanged = function (project) {
        this.log("Config file changed: " + project.projectFilename);
        var configFileErrors = this.updateConfiguredProject(project);
        this.updateProjectStructure();
        if (configFileErrors && configFileErrors.length > 0 && this.eventHandler) {
            this.eventHandler({ eventName: "configFileDiag", data: { triggerFile: project.projectFilename, configFileName: project.projectFilename, diagnostics: configFileErrors } });
        }
    };
    ProjectService.prototype.log = function (msg, type) {
        if (type === void 0) { type = "Err"; }
        this.psLogger.msg(msg, type);
    };
    ProjectService.prototype.closeLog = function () {
        this.psLogger.close();
    };
    ProjectService.prototype.createInferredProject = function (root) {
        var project = new Project(this, this.psLogger);
        project.addRoot(root);
        project.finishGraph();
        this.inferredProjects.push(project);
        return project;
    };
    ProjectService.prototype.fileDeletedInFilesystem = function (info) {
        this.psLogger.info(info.fileName + " deleted");
        if (info.fileWatcher) {
            info.fileWatcher.close();
            info.fileWatcher = undefined;
        }
        if (!info.isOpen) {
            this.filenameToScriptInfo[info.fileName] = undefined;
            var referencingProjects = this.findReferencingProjects(info);
            if (info.defaultProject) {
                info.defaultProject.removeRoot(info);
            }
            for (var i = 0, len = referencingProjects.length; i < len; i++) {
                referencingProjects[i].removeReferencedFile(info);
            }
            for (var j = 0, flen = this.openFileRoots.length; j < flen; j++) {
                var openFile = this.openFileRoots[j];
                this.report("context", openFile.fileName, openFile.defaultProject);
            }
            for (var j = 0, flen = this.openFilesReferenced.length; j < flen; j++) {
                var openFile = this.openFilesReferenced[j];
                this.report("context", openFile.fileName, openFile.defaultProject);
            }
        }
        this.printProjects();
    };
    ProjectService.prototype.updateConfiguredProjectList = function () {
        var configuredProjects = [];
        for (var i = 0, len = this.configuredProjects.length; i < len; i++) {
            if (this.configuredProjects[i].openRefCount > 0) {
                configuredProjects.push(this.configuredProjects[i]);
            }
        }
        this.configuredProjects = configuredProjects;
    };
    ProjectService.prototype.removeProject = function (project) {
        this.log("remove project: " + project.getRootFiles().toString());
        if (project.isConfiguredProject()) {
            project.projectFileWatcher.close();
            project.directoryWatcher.close();
            forEachProperty(project.directoriesWatchedForWildcards, function (watcher) { watcher.close(); });
            delete project.directoriesWatchedForWildcards;
            this.configuredProjects = copyListRemovingItem(project, this.configuredProjects);
        }
        else {
            for (var _i = 0, _a = project.directoriesWatchedForTsconfig; _i < _a.length; _i++) {
                var directory = _a[_i];
                // if the ref count for this directory watcher drops to 0, it's time to close it
                project.projectService.directoryWatchersRefCount[directory]--;
                if (!project.projectService.directoryWatchersRefCount[directory]) {
                    this.log("Close directory watcher for: " + directory);
                    project.projectService.directoryWatchersForTsconfig[directory].close();
                    delete project.projectService.directoryWatchersForTsconfig[directory];
                }
            }
            this.inferredProjects = copyListRemovingItem(project, this.inferredProjects);
        }
        var fileNames = project.getFileNames();
        for (var _b = 0, fileNames_1 = fileNames; _b < fileNames_1.length; _b++) {
            var fileName = fileNames_1[_b];
            var info = this.getScriptInfo(fileName);
            if (info.defaultProject == project) {
                info.defaultProject = undefined;
            }
        }
    };
    ProjectService.prototype.setConfiguredProjectRoot = function (info) {
        for (var i = 0, len = this.configuredProjects.length; i < len; i++) {
            var configuredProject = this.configuredProjects[i];
            if (configuredProject.isRoot(info)) {
                info.defaultProject = configuredProject;
                configuredProject.addOpenRef();
                return true;
            }
        }
        return false;
    };
    ProjectService.prototype.addOpenFile = function (info) {
        if (this.setConfiguredProjectRoot(info)) {
            this.openFileRootsConfigured.push(info);
        }
        else {
            this.findReferencingProjects(info);
            if (info.defaultProject) {
                info.defaultProject.addOpenRef();
                this.openFilesReferenced.push(info);
            }
            else {
                // create new inferred project p with the newly opened file as root
                info.defaultProject = this.createInferredProject(info);
                var openFileRoots = [];
                // for each inferred project root r
                for (var i = 0, len = this.openFileRoots.length; i < len; i++) {
                    var r = this.openFileRoots[i];
                    // if r referenced by the new project
                    if (info.defaultProject.references(r)) {
                        // remove project rooted at r
                        this.removeProject(r.defaultProject);
                        // put r in referenced open file list
                        this.openFilesReferenced.push(r);
                        // set default project of r to the new project
                        r.defaultProject = info.defaultProject;
                    }
                    else {
                        // otherwise, keep r as root of inferred project
                        openFileRoots.push(r);
                    }
                }
                this.openFileRoots = openFileRoots;
                this.openFileRoots.push(info);
            }
        }
        this.updateConfiguredProjectList();
        this.report("opened", info.fileName, info.defaultProject);
    };
    /**
      * Remove this file from the set of open, non-configured files.
      * @param info The file that has been closed or newly configured
      */
    ProjectService.prototype.closeOpenFile = function (info) {
        // Closing file should trigger re-reading the file content from disk. This is
        // because the user may chose to discard the buffer content before saving
        // to the disk, and the server's version of the file can be out of sync.
        info.svc.reloadFromFile(info.fileName);
        var openFileRoots = [];
        var removedProject;
        for (var i = 0, len = this.openFileRoots.length; i < len; i++) {
            // if closed file is root of project
            if (info === this.openFileRoots[i]) {
                // remove that project and remember it
                removedProject = info.defaultProject;
            }
            else {
                openFileRoots.push(this.openFileRoots[i]);
            }
        }
        this.openFileRoots = openFileRoots;
        if (!removedProject) {
            var openFileRootsConfigured = [];
            for (var i = 0, len = this.openFileRootsConfigured.length; i < len; i++) {
                if (info === this.openFileRootsConfigured[i]) {
                    if (info.defaultProject.deleteOpenRef() === 0) {
                        removedProject = info.defaultProject;
                    }
                }
                else {
                    openFileRootsConfigured.push(this.openFileRootsConfigured[i]);
                }
            }
            this.openFileRootsConfigured = openFileRootsConfigured;
        }
        if (removedProject) {
            this.removeProject(removedProject);
            var openFilesReferenced = [];
            var orphanFiles = [];
            // for all open, referenced files f
            for (var i = 0, len = this.openFilesReferenced.length; i < len; i++) {
                var f = this.openFilesReferenced[i];
                // if f was referenced by the removed project, remember it
                if (f.defaultProject === removedProject || !f.defaultProject) {
                    f.defaultProject = undefined;
                    orphanFiles.push(f);
                }
                else {
                    // otherwise add it back to the list of referenced files
                    openFilesReferenced.push(f);
                }
            }
            this.openFilesReferenced = openFilesReferenced;
            // treat orphaned files as newly opened
            for (var i = 0, len = orphanFiles.length; i < len; i++) {
                this.addOpenFile(orphanFiles[i]);
            }
        }
        else {
            this.openFilesReferenced = copyListRemovingItem(info, this.openFilesReferenced);
        }
        this.report("closed", info.fileName, info.defaultProject);
        info.close();
    };
    ProjectService.prototype.findReferencingProjects = function (info, excludedProject) {
        var referencingProjects = [];
        info.defaultProject = undefined;
        for (var i = 0, len = this.inferredProjects.length; i < len; i++) {
            var inferredProject = this.inferredProjects[i];
            inferredProject.updateGraph();
            if (inferredProject !== excludedProject) {
                if (inferredProject.references(info)) {
                    info.defaultProject = inferredProject;
                    referencingProjects.push(inferredProject);
                }
            }
        }
        for (var i = 0, len = this.configuredProjects.length; i < len; i++) {
            var configuredProject = this.configuredProjects[i];
            configuredProject.updateGraph();
            if (configuredProject.references(info)) {
                info.defaultProject = configuredProject;
                referencingProjects.push(configuredProject);
            }
        }
        return referencingProjects;
    };
    /**
     * This function rebuilds the project for every file opened by the client
     */
    ProjectService.prototype.reloadProjects = function () {
        this.log("reload projects.");
        // First check if there is new tsconfig file added for inferred project roots
        for (var _i = 0, _a = this.openFileRoots; _i < _a.length; _i++) {
            var info = _a[_i];
            this.openOrUpdateConfiguredProjectForFile(info.fileName);
        }
        this.updateProjectStructure();
    };
    /**
     * This function is to update the project structure for every projects.
     * It is called on the premise that all the configured projects are
     * up to date.
     */
    ProjectService.prototype.updateProjectStructure = function () {
        this.log("updating project structure from ...", "Info");
        this.printProjects();
        var unattachedOpenFiles = [];
        var openFileRootsConfigured = [];
        for (var _i = 0, _a = this.openFileRootsConfigured; _i < _a.length; _i++) {
            var info = _a[_i];
            var project = info.defaultProject;
            if (!project || !(project.references(info))) {
                info.defaultProject = undefined;
                unattachedOpenFiles.push(info);
            }
            else {
                openFileRootsConfigured.push(info);
            }
        }
        this.openFileRootsConfigured = openFileRootsConfigured;
        // First loop through all open files that are referenced by projects but are not
        // project roots.  For each referenced file, see if the default project still
        // references that file.  If so, then just keep the file in the referenced list.
        // If not, add the file to an unattached list, to be rechecked later.
        var openFilesReferenced = [];
        for (var i = 0, len = this.openFilesReferenced.length; i < len; i++) {
            var referencedFile = this.openFilesReferenced[i];
            referencedFile.defaultProject.updateGraph();
            var references = referencedFile.defaultProject.references(referencedFile);
            if (references) {
                openFilesReferenced.push(referencedFile);
            }
            else {
                unattachedOpenFiles.push(referencedFile);
            }
        }
        this.openFilesReferenced = openFilesReferenced;
        // Then, loop through all of the open files that are project roots.
        // For each root file, note the project that it roots.  Then see if
        // any other projects newly reference the file.  If zero projects
        // newly reference the file, keep it as a root.  If one or more
        // projects newly references the file, remove its project from the
        // inferred projects list (since it is no longer a root) and add
        // the file to the open, referenced file list.
        var openFileRoots = [];
        for (var i = 0, len = this.openFileRoots.length; i < len; i++) {
            var rootFile = this.openFileRoots[i];
            var rootedProject = rootFile.defaultProject;
            var referencingProjects = this.findReferencingProjects(rootFile, rootedProject);
            if (rootFile.defaultProject && rootFile.defaultProject.isConfiguredProject()) {
                // If the root file has already been added into a configured project,
                // meaning the original inferred project is gone already.
                if (!rootedProject.isConfiguredProject()) {
                    this.removeProject(rootedProject);
                }
                this.openFileRootsConfigured.push(rootFile);
            }
            else {
                if (referencingProjects.length === 0) {
                    rootFile.defaultProject = rootedProject;
                    openFileRoots.push(rootFile);
                }
                else {
                    // remove project from inferred projects list because root captured
                    this.removeProject(rootedProject);
                    this.openFilesReferenced.push(rootFile);
                }
            }
        }
        this.openFileRoots = openFileRoots;
        // Finally, if we found any open, referenced files that are no longer
        // referenced by their default project, treat them as newly opened
        // by the editor.
        for (var i = 0, len = unattachedOpenFiles.length; i < len; i++) {
            this.addOpenFile(unattachedOpenFiles[i]);
        }
        // Update Angular summaries
        var start = Date.now();
        for (var _b = 0, _c = this.configuredProjects; _b < _c.length; _b++) {
            var project = _c[_b];
            project.compilerService.ngHost.updateAnalyzedModules();
        }
        for (var _d = 0, _e = this.inferredProjects; _d < _e.length; _d++) {
            var project = _e[_d];
            project.compilerService.ngHost.updateAnalyzedModules();
        }
        this.log("updated: ng - " + (Date.now() - start) + "ms", "Info");
        this.printProjects();
    };
    ProjectService.prototype.getScriptInfo = function (filename) {
        filename = normalizePath(filename);
        return this.filenameToScriptInfo[filename];
    };
    /**
     * @param filename is absolute pathname
     * @param fileContent is a known version of the file content that is more up to date than the one on disk
     */
    ProjectService.prototype.openFile = function (fileName, openedByClient, fileContent, scriptKind) {
        var _this = this;
        fileName = normalizePath(fileName);
        var info = this.filenameToScriptInfo[fileName];
        if (!info) {
            var content = void 0;
            if (this.host.fileExists(fileName)) {
                content = fileContent || this.host.readFile(fileName);
            }
            if (!content) {
                if (openedByClient) {
                    content = "";
                }
            }
            if (content !== undefined) {
                info = new ScriptInfo(this.host, fileName, content, openedByClient);
                info.scriptKind = scriptKind;
                // info.setFormatOptions(this.getFormatCodeOptions());
                this.filenameToScriptInfo[fileName] = info;
                if (!info.isOpen) {
                    info.fileWatcher = this.host.watchFile(fileName, function (_) { _this.watchedFileChanged(fileName); });
                }
            }
        }
        if (info) {
            if (fileContent) {
                info.svc.reload(fileContent);
            }
            if (openedByClient) {
                info.isOpen = true;
            }
        }
        return info;
    };
    // This is different from the method the compiler uses because
    // the compiler can assume it will always start searching in the
    // current directory (the directory in which tsc was invoked).
    // The server must start searching from the directory containing
    // the newly opened file.
    ProjectService.prototype.findConfigFile = function (searchPath) {
        while (true) {
            var tsconfigFileName = combinePaths(searchPath, "tsconfig.json");
            if (this.host.fileExists(tsconfigFileName)) {
                return tsconfigFileName;
            }
            var jsconfigFileName = combinePaths(searchPath, "jsconfig.json");
            if (this.host.fileExists(jsconfigFileName)) {
                return jsconfigFileName;
            }
            var parentPath = getDirectoryPath(searchPath);
            if (parentPath === searchPath) {
                break;
            }
            searchPath = parentPath;
        }
        return undefined;
    };
    /**
     * Open file whose contents is managed by the client
     * @param filename is absolute pathname
     * @param fileContent is a known version of the file content that is more up to date than the one on disk
     */
    ProjectService.prototype.openClientFile = function (fileName, fileContent, scriptKind) {
        var _a = this.openOrUpdateConfiguredProjectForFile(fileName), configFileName = _a.configFileName, configFileErrors = _a.configFileErrors;
        var info = this.openFile(fileName, /*openedByClient*/ true, fileContent, scriptKind);
        this.addOpenFile(info);
        this.printProjects();
        this.report("opened", info.fileName);
        return { configFileName: configFileName, configFileErrors: configFileErrors };
    };
    /**
     * Report a client file change.
     */
    ProjectService.prototype.clientFileChanges = function (fileName, changes) {
        var _this = this;
        var file = normalizePath(fileName);
        var project = this.getProjectForFile(file);
        if (project && !project.languageServiceDiabled) {
            var compilerService = project.compilerService;
            for (var _i = 0, changes_1 = changes; _i < changes_1.length; _i++) {
                var change = changes_1[_i];
                if (change.start >= 0) {
                    compilerService.host.editScript(file, change.start, change.end, change.insertText);
                    this.changeSeq++;
                }
            }
            this.requestUpdateProjectStructure(this.changeSeq, function (n) { return n === _this.changeSeq; });
        }
        this.report("change", file, project);
    };
    ProjectService.prototype.forcedGetProjectForFile = function (fileName) {
        var file = normalizePath(fileName);
        var info = this.filenameToScriptInfo[file];
        if (info) {
            var project = info.defaultProject;
            if (!project) {
                // Force the association of the info with a default project.
                this.findReferencingProjects(info);
                project = info.defaultProject;
            }
            return project;
        }
    };
    ProjectService.prototype.lineOffsetsToPositions = function (fileName, positions) {
        var project = this.forcedGetProjectForFile(fileName);
        if (project && !project.languageServiceDiabled) {
            var compilerService_1 = project.compilerService;
            return positions.map(function (position) { return compilerService_1.host.lineOffsetToPosition(fileName, position.line, position.col); });
        }
    };
    ProjectService.prototype.positionsToLineOffsets = function (fileName, offsets) {
        var project = this.forcedGetProjectForFile(fileName);
        if (project && !project.languageServiceDiabled) {
            var compilerService_2 = project.compilerService;
            return offsets.map(function (offset) { return compilerService_2.host.positionToLineOffset(fileName, offset); }).map(function (pos) { return ({ line: pos.line, col: pos.offset }); });
        }
    };
    ProjectService.prototype.positionToLineOffset = function (fileName, offset) {
        var project = this.forcedGetProjectForFile(fileName);
        if (project && !project.languageServiceDiabled) {
            var compilerService = project.compilerService;
            return compilerService.host.positionToLineOffset(fileName, offset);
        }
    };
    ProjectService.prototype.requestUpdateProjectStructure = function (changeSeq, matchSeq) {
        var _this = this;
        this.host.setTimeout(function () {
            if (matchSeq(changeSeq)) {
                _this.updateProjectStructure();
            }
        }, 1500);
    };
    /**
     * This function tries to search for a tsconfig.json for the given file. If we found it,
     * we first detect if there is already a configured project created for it: if so, we re-read
     * the tsconfig file content and update the project; otherwise we create a new one.
     */
    ProjectService.prototype.openOrUpdateConfiguredProjectForFile = function (fileName) {
        var searchPath = normalizePath(getDirectoryPath(fileName));
        this.log("Search path: " + searchPath, "Info");
        var configFileName = this.findConfigFile(searchPath);
        if (configFileName) {
            this.log("Config file name: " + configFileName, "Info");
            var project = this.findConfiguredProjectByConfigFile(configFileName);
            if (!project) {
                var configResult = this.openConfigFile(configFileName, fileName);
                if (!configResult.project) {
                    return { configFileName: configFileName, configFileErrors: configResult.errors };
                }
                else {
                    // even if opening config file was successful, it could still
                    // contain errors that were tolerated.
                    this.log("Opened configuration file " + configFileName, "Info");
                    this.configuredProjects.push(configResult.project);
                    if (configResult.errors && configResult.errors.length > 0) {
                        return { configFileName: configFileName, configFileErrors: configResult.errors };
                    }
                }
            }
            else {
                this.updateConfiguredProject(project);
            }
            return { configFileName: configFileName };
        }
        else {
            this.log("No config files found.");
        }
        return {};
    };
    /**
     * Close file whose contents is managed by the client
     * @param filename is absolute pathname
     */
    ProjectService.prototype.closeClientFile = function (filename) {
        var info = this.filenameToScriptInfo[filename];
        if (info) {
            this.closeOpenFile(info);
            info.isOpen = false;
            this.report("closed", info.fileName);
        }
        this.printProjects();
    };
    ProjectService.prototype.getProjectForFile = function (filename) {
        var scriptInfo = this.filenameToScriptInfo[filename];
        if (scriptInfo) {
            return scriptInfo.defaultProject;
        }
    };
    ProjectService.prototype.printProjectsForFile = function (filename) {
        var scriptInfo = this.filenameToScriptInfo[filename];
        if (scriptInfo) {
            this.psLogger.startGroup();
            this.psLogger.info("Projects for " + filename);
            var projects = this.findReferencingProjects(scriptInfo);
            for (var i = 0, len = projects.length; i < len; i++) {
                this.psLogger.info("Project " + i.toString());
            }
            this.psLogger.endGroup();
        }
        else {
            this.psLogger.info(filename + " not in any project");
        }
    };
    ProjectService.prototype.printProjects = function () {
        if (!this.psLogger.isVerbose()) {
            return;
        }
        this.psLogger.startGroup();
        for (var i = 0, len = this.inferredProjects.length; i < len; i++) {
            var project = this.inferredProjects[i];
            project.updateGraph();
            this.psLogger.info("Project " + i.toString());
            this.psLogger.info(project.filesToString());
            this.psLogger.info("-----------------------------------------------");
        }
        for (var i = 0, len = this.configuredProjects.length; i < len; i++) {
            var project = this.configuredProjects[i];
            project.updateGraph();
            this.psLogger.info("Project (configured) " + (i + this.inferredProjects.length).toString());
            this.psLogger.info(project.filesToString());
            this.psLogger.info("-----------------------------------------------");
        }
        this.psLogger.info("Open file roots of inferred projects: ");
        for (var i = 0, len = this.openFileRoots.length; i < len; i++) {
            this.psLogger.info(this.openFileRoots[i].fileName);
        }
        this.psLogger.info("Open files referenced by inferred or configured projects: ");
        for (var i = 0, len = this.openFilesReferenced.length; i < len; i++) {
            var fileInfo = this.openFilesReferenced[i].fileName;
            if (this.openFilesReferenced[i].defaultProject.isConfiguredProject()) {
                fileInfo += " (configured)";
            }
            this.psLogger.info(fileInfo);
        }
        this.psLogger.info("Open file roots of configured projects: ");
        for (var i = 0, len = this.openFileRootsConfigured.length; i < len; i++) {
            this.psLogger.info(this.openFileRootsConfigured[i].fileName);
        }
        this.psLogger.endGroup();
    };
    ProjectService.prototype.configProjectIsActive = function (fileName) {
        return this.findConfiguredProjectByConfigFile(fileName) === undefined;
    };
    ProjectService.prototype.findConfiguredProjectByConfigFile = function (configFileName) {
        for (var i = 0, len = this.configuredProjects.length; i < len; i++) {
            if (this.configuredProjects[i].projectFilename == configFileName) {
                return this.configuredProjects[i];
            }
        }
        return undefined;
    };
    ProjectService.prototype.configFileToProjectOptions = function (configFilename) {
        configFilename = normalizePath(configFilename);
        var errors = [];
        // file references will be relative to dirPath (or absolute)
        var dirPath = getDirectoryPath(configFilename);
        var contents = this.host.readFile(configFilename);
        var _a = parseAndReEmitConfigJSONFile(contents), configJsonObject = _a.configJsonObject, diagnostics = _a.diagnostics;
        errors = concatenate(errors, diagnostics);
        var parsedCommandLine = ts.parseJsonConfigFileContent(configJsonObject, this.host, dirPath, /*existingOptions*/ {}, configFilename);
        errors = concatenate(errors, parsedCommandLine.errors);
        //      Debug.assert(!!parsedCommandLine.fileNames);
        if (parsedCommandLine.fileNames.length === 0) {
            // errors.push(createCompilerDiagnostic(Diagnostics.The_config_file_0_found_doesn_t_contain_any_source_files, configFilename));
            return { errors: errors };
        }
        else {
            // if the project has some files, we can continue with the parsed options and tolerate
            // errors in the parsedCommandLine
            var projectOptions = {
                files: parsedCommandLine.fileNames,
                wildcardDirectories: parsedCommandLine.wildcardDirectories,
                compilerOptions: parsedCommandLine.options,
            };
            return { projectOptions: projectOptions, errors: errors };
        }
    };
    ProjectService.prototype.openConfigFile = function (configFilename, clientFileName) {
        var _this = this;
        var parseConfigFileResult = this.configFileToProjectOptions(configFilename);
        var errors = parseConfigFileResult.errors;
        if (!parseConfigFileResult.projectOptions) {
            return { errors: errors };
        }
        var projectOptions = parseConfigFileResult.projectOptions;
        var project = this.createProject(configFilename, projectOptions);
        for (var _i = 0, _a = projectOptions.files; _i < _a.length; _i++) {
            var rootFilename = _a[_i];
            if (this.host.fileExists(rootFilename)) {
                var info = this.openFile(rootFilename, /*openedByClient*/ clientFileName == rootFilename);
                project.addRoot(info);
            }
        }
        project.finishGraph();
        project.projectFileWatcher = this.host.watchFile(configFilename, function (_) { return _this.watchedProjectConfigFileChanged(project); });
        var configDirectoryPath = getDirectoryPath(configFilename);
        this.log("Add recursive watcher for: " + configDirectoryPath);
        project.directoryWatcher = this.host.watchDirectory(configDirectoryPath, function (path) { return _this.directoryWatchedForSourceFilesChanged(project, path); }, 
        /*recursive*/ true);
        project.directoriesWatchedForWildcards = reduceProperties(createMap(projectOptions.wildcardDirectories), function (watchers, flag, directory) {
            if (comparePaths(configDirectoryPath, directory, ".", !_this.host.useCaseSensitiveFileNames) !== 0 /* EqualTo */) {
                var recursive = (flag & ts.WatchDirectoryFlags.Recursive) !== 0;
                _this.log("Add " + (recursive ? "recursive " : "") + "watcher for: " + directory);
                watchers[directory] = _this.host.watchDirectory(directory, function (path) { return _this.directoryWatchedForSourceFilesChanged(project, path); }, recursive);
            }
            return watchers;
        }, {});
        return { project: project, errors: errors };
    };
    ProjectService.prototype.updateConfiguredProject = function (project) {
        var _this = this;
        if (!this.host.fileExists(project.projectFilename)) {
            this.log("Config file deleted");
            this.removeProject(project);
        }
        else {
            var _a = this.configFileToProjectOptions(project.projectFilename), projectOptions = _a.projectOptions, errors = _a.errors;
            if (!projectOptions) {
                return errors;
            }
            else {
                if (project.languageServiceDiabled) {
                    project.setProjectOptions(projectOptions);
                    project.enableLanguageService();
                    project.directoryWatcher = this.host.watchDirectory(getDirectoryPath(project.projectFilename), function (path) { return _this.directoryWatchedForSourceFilesChanged(project, path); }, 
                    /*recursive*/ true);
                    for (var _i = 0, _b = projectOptions.files; _i < _b.length; _i++) {
                        var rootFilename = _b[_i];
                        if (this.host.fileExists(rootFilename)) {
                            var info = this.openFile(rootFilename, /*openedByClient*/ false);
                            project.addRoot(info);
                        }
                    }
                    project.finishGraph();
                    return errors;
                }
                // if the project is too large, the root files might not have been all loaded if the total
                // program size reached the upper limit. In that case project.projectOptions.files should
                // be more precise. However this would only happen for configured project.
                var oldFileNames_1 = project.projectOptions ? project.projectOptions.files : project.compilerService.host.roots.map(function (info) { return info.fileName; });
                var newFileNames_1 = filter(projectOptions.files, function (f) { return _this.host.fileExists(f); });
                var fileNamesToRemove = oldFileNames_1.filter(function (f) { return newFileNames_1.indexOf(f) < 0; });
                var fileNamesToAdd = newFileNames_1.filter(function (f) { return oldFileNames_1.indexOf(f) < 0; });
                for (var _c = 0, fileNamesToRemove_1 = fileNamesToRemove; _c < fileNamesToRemove_1.length; _c++) {
                    var fileName = fileNamesToRemove_1[_c];
                    var info = this.getScriptInfo(fileName);
                    if (info) {
                        project.removeRoot(info);
                    }
                }
                for (var _d = 0, fileNamesToAdd_1 = fileNamesToAdd; _d < fileNamesToAdd_1.length; _d++) {
                    var fileName = fileNamesToAdd_1[_d];
                    var info = this.getScriptInfo(fileName);
                    if (!info) {
                        info = this.openFile(fileName, /*openedByClient*/ false);
                    }
                    else {
                        // if the root file was opened by client, it would belong to either
                        // openFileRoots or openFileReferenced.
                        if (info.isOpen) {
                            if (this.openFileRoots.indexOf(info) >= 0) {
                                this.openFileRoots = copyListRemovingItem(info, this.openFileRoots);
                                if (info.defaultProject && !info.defaultProject.isConfiguredProject()) {
                                    this.removeProject(info.defaultProject);
                                }
                            }
                            if (this.openFilesReferenced.indexOf(info) >= 0) {
                                this.openFilesReferenced = copyListRemovingItem(info, this.openFilesReferenced);
                            }
                            this.openFileRootsConfigured.push(info);
                            info.defaultProject = project;
                        }
                    }
                    project.addRoot(info);
                }
                project.setProjectOptions(projectOptions);
                project.finishGraph();
            }
            return errors;
        }
    };
    ProjectService.prototype.createProject = function (projectFilename, projectOptions, languageServiceDisabled) {
        var project = new Project(this, this.psLogger, projectOptions, languageServiceDisabled);
        project.projectFilename = projectFilename;
        return project;
    };
    return ProjectService;
}());
exports.ProjectService = ProjectService;
var CompilerService = (function () {
    function CompilerService(project, logger, opt) {
        this.project = project;
        this.logger = logger;
        this.documentRegistry = ts.createDocumentRegistry();
        this.host = new LSHost(project.projectService.host, project);
        if (opt) {
            this.setCompilerOptions(opt);
        }
        else {
            var defaultOpts = ts.getDefaultCompilerOptions();
            defaultOpts['allowNonTsExtensions'] = true;
            defaultOpts.allowJs = true;
            this.setCompilerOptions(defaultOpts);
        }
        this.languageService = ts.createLanguageService(this.host, this.documentRegistry);
        this.ng = this.resolveLanguageServiceModule();
        this.log("Angular Language Service: " + this.ng.VERSION.full);
        this.log("TypeScript: " + ts.version);
        this.ngHost = new this.ng.TypeScriptServiceHost(this.host, this.languageService);
        this.ngService = logServiceTimes(logger, this.ng.createLanguageService(this.ngHost));
        this.ngHost.setSite(this.ngService);
        this.classifier = ts.createClassifier();
    }
    CompilerService.prototype.setCompilerOptions = function (opt) {
        this.settings = opt;
        this.host.setCompilationSettings(opt);
    };
    CompilerService.prototype.isExternalModule = function (filename) {
        var sourceFile = this.languageService.getNonBoundSourceFile(filename);
        return ts.isExternalModule(sourceFile);
    };
    CompilerService.prototype.resolveLanguageServiceModule = function () {
        var host = path.resolve(this.host.getCurrentDirectory(), 'main.ts');
        var modules = this.host.resolveModuleNames(['@angular/language-service'], host);
        var result = ng;
        if (modules && modules[0]) {
            var resolvedModule = modules[0];
            var moduleName = path.dirname(resolvedModule.resolvedFileName);
            if (fs.existsSync(moduleName)) {
                try {
                    result = require(moduleName) || result;
                }
                catch (e) {
                    this.log("Error loading module \"" + moduleName + "\"; using local language service instead");
                    this.log(e.stack);
                }
            }
        }
        if (typeof result === 'function') {
            // The language service bundle exposes a function to allow hooking module dependencies
            // such as TypeScript. However, using require() here is sufficient for us.
            result = result();
        }
        return result;
    };
    CompilerService.prototype.log = function (message) {
        return this.logger.msg(message);
    };
    CompilerService.getDefaultFormatCodeOptions = function (host) {
        return clone({
            BaseIndentSize: 0,
            IndentSize: 4,
            TabSize: 4,
            NewLineCharacter: host.newLine || "\n",
            ConvertTabsToSpaces: true,
            IndentStyle: ts.IndentStyle.Smart,
            InsertSpaceAfterCommaDelimiter: true,
            InsertSpaceAfterSemicolonInForStatements: true,
            InsertSpaceBeforeAndAfterBinaryOperators: true,
            InsertSpaceAfterKeywordsInControlFlowStatements: true,
            InsertSpaceAfterFunctionKeywordForAnonymousFunctions: false,
            InsertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis: false,
            InsertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets: false,
            InsertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces: false,
            InsertSpaceAfterOpeningAndBeforeClosingJsxExpressionBraces: false,
            PlaceOpenBraceOnNewLineForFunctions: false,
            PlaceOpenBraceOnNewLineForControlBlocks: false,
        });
    };
    return CompilerService;
}());
exports.CompilerService = CompilerService;
var CharRangeSection;
(function (CharRangeSection) {
    CharRangeSection[CharRangeSection["PreStart"] = 0] = "PreStart";
    CharRangeSection[CharRangeSection["Start"] = 1] = "Start";
    CharRangeSection[CharRangeSection["Entire"] = 2] = "Entire";
    CharRangeSection[CharRangeSection["Mid"] = 3] = "Mid";
    CharRangeSection[CharRangeSection["End"] = 4] = "End";
    CharRangeSection[CharRangeSection["PostEnd"] = 5] = "PostEnd";
})(CharRangeSection = exports.CharRangeSection || (exports.CharRangeSection = {}));
var BaseLineIndexWalker = (function () {
    function BaseLineIndexWalker() {
        this.goSubtree = true;
        this.done = false;
    }
    BaseLineIndexWalker.prototype.leaf = function (rangeStart, rangeLength, ll) {
    };
    return BaseLineIndexWalker;
}());
var EditWalker = (function (_super) {
    __extends(EditWalker, _super);
    function EditWalker() {
        var _this = _super.call(this) || this;
        _this.lineIndex = new LineIndex();
        _this.endBranch = [];
        _this.state = CharRangeSection.Entire;
        _this.initialText = "";
        _this.trailingText = "";
        _this.suppressTrailingText = false;
        _this.lineIndex.root = new LineNode();
        _this.startPath = [_this.lineIndex.root];
        _this.stack = [_this.lineIndex.root];
        return _this;
    }
    EditWalker.prototype.insertLines = function (insertedText) {
        if (this.suppressTrailingText) {
            this.trailingText = "";
        }
        if (insertedText) {
            insertedText = this.initialText + insertedText + this.trailingText;
        }
        else {
            insertedText = this.initialText + this.trailingText;
        }
        var lm = LineIndex.linesFromText(insertedText);
        var lines = lm.lines;
        if (lines.length > 1) {
            if (lines[lines.length - 1] == "") {
                lines.length--;
            }
        }
        var branchParent;
        var lastZeroCount;
        for (var k = this.endBranch.length - 1; k >= 0; k--) {
            this.endBranch[k].updateCounts();
            if (this.endBranch[k].charCount() === 0) {
                lastZeroCount = this.endBranch[k];
                if (k > 0) {
                    branchParent = this.endBranch[k - 1];
                }
                else {
                    branchParent = this.branchNode;
                }
            }
        }
        if (lastZeroCount) {
            branchParent.remove(lastZeroCount);
        }
        // path at least length two (root and leaf)
        var insertionNode = this.startPath[this.startPath.length - 2];
        var leafNode = this.startPath[this.startPath.length - 1];
        var len = lines.length;
        if (len > 0) {
            leafNode.text = lines[0];
            if (len > 1) {
                var insertedNodes = new Array(len - 1);
                var startNode = leafNode;
                for (var i = 1, len_1 = lines.length; i < len_1; i++) {
                    insertedNodes[i - 1] = new LineLeaf(lines[i]);
                }
                var pathIndex = this.startPath.length - 2;
                while (pathIndex >= 0) {
                    insertionNode = this.startPath[pathIndex];
                    insertedNodes = insertionNode.insertAt(startNode, insertedNodes);
                    pathIndex--;
                    startNode = insertionNode;
                }
                var insertedNodesLen = insertedNodes.length;
                while (insertedNodesLen > 0) {
                    var newRoot = new LineNode();
                    newRoot.add(this.lineIndex.root);
                    insertedNodes = newRoot.insertAt(this.lineIndex.root, insertedNodes);
                    insertedNodesLen = insertedNodes.length;
                    this.lineIndex.root = newRoot;
                }
                this.lineIndex.root.updateCounts();
            }
            else {
                for (var j = this.startPath.length - 2; j >= 0; j--) {
                    this.startPath[j].updateCounts();
                }
            }
        }
        else {
            // no content for leaf node, so delete it
            insertionNode.remove(leafNode);
            for (var j = this.startPath.length - 2; j >= 0; j--) {
                this.startPath[j].updateCounts();
            }
        }
        return this.lineIndex;
    };
    EditWalker.prototype.post = function (relativeStart, relativeLength, lineCollection, parent, nodeType) {
        // have visited the path for start of range, now looking for end
        // if range is on single line, we will never make this state transition
        if (lineCollection === this.lineCollectionAtBranch) {
            this.state = CharRangeSection.End;
        }
        // always pop stack because post only called when child has been visited
        this.stack.length--;
        return undefined;
    };
    EditWalker.prototype.pre = function (relativeStart, relativeLength, lineCollection, parent, nodeType) {
        // currentNode corresponds to parent, but in the new tree
        var currentNode = this.stack[this.stack.length - 1];
        if ((this.state === CharRangeSection.Entire) && (nodeType === CharRangeSection.Start)) {
            // if range is on single line, we will never make this state transition
            this.state = CharRangeSection.Start;
            this.branchNode = currentNode;
            this.lineCollectionAtBranch = lineCollection;
        }
        var child;
        function fresh(node) {
            if (node.isLeaf()) {
                return new LineLeaf("");
            }
            else
                return new LineNode();
        }
        switch (nodeType) {
            case CharRangeSection.PreStart:
                this.goSubtree = false;
                if (this.state !== CharRangeSection.End) {
                    currentNode.add(lineCollection);
                }
                break;
            case CharRangeSection.Start:
                if (this.state === CharRangeSection.End) {
                    this.goSubtree = false;
                }
                else {
                    child = fresh(lineCollection);
                    currentNode.add(child);
                    this.startPath[this.startPath.length] = child;
                }
                break;
            case CharRangeSection.Entire:
                if (this.state !== CharRangeSection.End) {
                    child = fresh(lineCollection);
                    currentNode.add(child);
                    this.startPath[this.startPath.length] = child;
                }
                else {
                    if (!lineCollection.isLeaf()) {
                        child = fresh(lineCollection);
                        currentNode.add(child);
                        this.endBranch[this.endBranch.length] = child;
                    }
                }
                break;
            case CharRangeSection.Mid:
                this.goSubtree = false;
                break;
            case CharRangeSection.End:
                if (this.state !== CharRangeSection.End) {
                    this.goSubtree = false;
                }
                else {
                    if (!lineCollection.isLeaf()) {
                        child = fresh(lineCollection);
                        currentNode.add(child);
                        this.endBranch[this.endBranch.length] = child;
                    }
                }
                break;
            case CharRangeSection.PostEnd:
                this.goSubtree = false;
                if (this.state !== CharRangeSection.Start) {
                    currentNode.add(lineCollection);
                }
                break;
        }
        if (this.goSubtree) {
            this.stack[this.stack.length] = child;
        }
        return lineCollection;
    };
    // just gather text from the leaves
    EditWalker.prototype.leaf = function (relativeStart, relativeLength, ll) {
        if (this.state === CharRangeSection.Start) {
            this.initialText = ll.text.substring(0, relativeStart);
        }
        else if (this.state === CharRangeSection.Entire) {
            this.initialText = ll.text.substring(0, relativeStart);
            this.trailingText = ll.text.substring(relativeStart + relativeLength);
        }
        else {
            // state is CharRangeSection.End
            this.trailingText = ll.text.substring(relativeStart + relativeLength);
        }
    };
    return EditWalker;
}(BaseLineIndexWalker));
// text change information
var TextChange = (function () {
    function TextChange(pos, deleteLen, insertedText) {
        this.pos = pos;
        this.deleteLen = deleteLen;
        this.insertedText = insertedText;
    }
    TextChange.prototype.getTextChangeRange = function () {
        return ts.createTextChangeRange(ts.createTextSpan(this.pos, this.deleteLen), this.insertedText ? this.insertedText.length : 0);
    };
    return TextChange;
}());
exports.TextChange = TextChange;
var ScriptVersionCache = (function () {
    function ScriptVersionCache() {
        this.changes = [];
        this.versions = [];
        this.minVersion = 0; // no versions earlier than min version will maintain change history
        this.currentVersion = 0;
    }
    // REVIEW: can optimize by coalescing simple edits
    ScriptVersionCache.prototype.edit = function (pos, deleteLen, insertedText) {
        this.changes[this.changes.length] = new TextChange(pos, deleteLen, insertedText);
        if ((this.changes.length > ScriptVersionCache.changeNumberThreshold) ||
            (deleteLen > ScriptVersionCache.changeLengthThreshold) ||
            (insertedText && (insertedText.length > ScriptVersionCache.changeLengthThreshold))) {
            this.getSnapshot();
        }
    };
    ScriptVersionCache.prototype.latest = function () {
        return this.versions[this.currentVersion];
    };
    ScriptVersionCache.prototype.latestVersion = function () {
        if (this.changes.length > 0) {
            this.getSnapshot();
        }
        return this.currentVersion;
    };
    ScriptVersionCache.prototype.reloadFromFile = function (filename, cb) {
        var content = this.host.readFile(filename);
        // If the file doesn't exist or cannot be read, we should
        // wipe out its cached content on the server to avoid side effects.
        if (!content) {
            content = "";
        }
        this.reload(content);
        if (cb)
            cb();
    };
    // reload whole script, leaving no change history behind reload
    ScriptVersionCache.prototype.reload = function (script) {
        this.currentVersion++;
        this.changes = []; // history wiped out by reload
        var snap = new LineIndexSnapshot(this.currentVersion, this);
        this.versions[this.currentVersion] = snap;
        snap.index = new LineIndex();
        var lm = LineIndex.linesFromText(script);
        snap.index.load(lm.lines);
        // REVIEW: could use linked list
        for (var i = this.minVersion; i < this.currentVersion; i++) {
            this.versions[i] = undefined;
        }
        this.minVersion = this.currentVersion;
    };
    ScriptVersionCache.prototype.getSnapshot = function () {
        var snap = this.versions[this.currentVersion];
        if (this.changes.length > 0) {
            var snapIndex = this.latest().index;
            for (var i = 0, len = this.changes.length; i < len; i++) {
                var change = this.changes[i];
                snapIndex = snapIndex.edit(change.pos, change.deleteLen, change.insertedText);
            }
            snap = new LineIndexSnapshot(this.currentVersion + 1, this);
            snap.index = snapIndex;
            snap.changesSincePreviousVersion = this.changes;
            this.currentVersion = snap.version;
            this.versions[snap.version] = snap;
            this.changes = [];
            if ((this.currentVersion - this.minVersion) >= ScriptVersionCache.maxVersions) {
                var oldMin = this.minVersion;
                this.minVersion = (this.currentVersion - ScriptVersionCache.maxVersions) + 1;
                for (var j = oldMin; j < this.minVersion; j++) {
                    this.versions[j] = undefined;
                }
            }
        }
        return snap;
    };
    ScriptVersionCache.prototype.getTextChangesBetweenVersions = function (oldVersion, newVersion) {
        if (oldVersion < newVersion) {
            if (oldVersion >= this.minVersion) {
                var textChangeRanges = [];
                for (var i = oldVersion + 1; i <= newVersion; i++) {
                    var snap = this.versions[i];
                    for (var j = 0, len = snap.changesSincePreviousVersion.length; j < len; j++) {
                        var textChange = snap.changesSincePreviousVersion[j];
                        textChangeRanges[textChangeRanges.length] = textChange.getTextChangeRange();
                    }
                }
                return ts.collapseTextChangeRangesAcrossMultipleVersions(textChangeRanges);
            }
            else {
                return undefined;
            }
        }
        else {
            return ts.unchangedTextChangeRange;
        }
    };
    ScriptVersionCache.fromString = function (host, script) {
        var svc = new ScriptVersionCache();
        var snap = new LineIndexSnapshot(0, svc);
        svc.versions[svc.currentVersion] = snap;
        svc.host = host;
        snap.index = new LineIndex();
        var lm = LineIndex.linesFromText(script);
        snap.index.load(lm.lines);
        return svc;
    };
    ScriptVersionCache.changeNumberThreshold = 8;
    ScriptVersionCache.changeLengthThreshold = 256;
    ScriptVersionCache.maxVersions = 8;
    return ScriptVersionCache;
}());
exports.ScriptVersionCache = ScriptVersionCache;
var LineIndexSnapshot = (function () {
    function LineIndexSnapshot(version, cache) {
        this.version = version;
        this.cache = cache;
        this.changesSincePreviousVersion = [];
    }
    LineIndexSnapshot.prototype.getText = function (rangeStart, rangeEnd) {
        return this.index.getText(rangeStart, rangeEnd - rangeStart);
    };
    LineIndexSnapshot.prototype.getLength = function () {
        return this.index.root.charCount();
    };
    // this requires linear space so don't hold on to these
    LineIndexSnapshot.prototype.getLineStartPositions = function () {
        var starts = [-1];
        var count = 1;
        var pos = 0;
        this.index.every(function (ll, s, len) {
            starts[count] = pos;
            count++;
            pos += ll.text.length;
            return true;
        }, 0);
        return starts;
    };
    LineIndexSnapshot.prototype.getLineMapper = function () {
        var _this = this;
        return function (line) {
            return _this.index.lineNumberToInfo(line).offset;
        };
    };
    LineIndexSnapshot.prototype.getTextChangeRangeSinceVersion = function (scriptVersion) {
        if (this.version <= scriptVersion) {
            return ts.unchangedTextChangeRange;
        }
        else {
            return this.cache.getTextChangesBetweenVersions(scriptVersion, this.version);
        }
    };
    LineIndexSnapshot.prototype.getChangeRange = function (oldSnapshot) {
        var oldSnap = oldSnapshot;
        return this.getTextChangeRangeSinceVersion(oldSnap.version);
    };
    return LineIndexSnapshot;
}());
exports.LineIndexSnapshot = LineIndexSnapshot;
var LineIndex = (function () {
    function LineIndex() {
        // set this to true to check each edit for accuracy
        this.checkEdits = false;
    }
    LineIndex.prototype.charOffsetToLineNumberAndPos = function (charOffset) {
        return this.root.charOffsetToLineNumberAndPos(1, charOffset);
    };
    LineIndex.prototype.lineNumberToInfo = function (lineNumber) {
        var lineCount = this.root.lineCount();
        if (lineNumber <= lineCount) {
            var lineInfo = this.root.lineNumberToInfo(lineNumber, 0);
            lineInfo.line = lineNumber;
            return lineInfo;
        }
        else {
            return {
                line: lineNumber,
                offset: this.root.charCount()
            };
        }
    };
    LineIndex.prototype.load = function (lines) {
        if (lines.length > 0) {
            var leaves = [];
            for (var i = 0, len = lines.length; i < len; i++) {
                leaves[i] = new LineLeaf(lines[i]);
            }
            this.root = LineIndex.buildTreeFromBottom(leaves);
        }
        else {
            this.root = new LineNode();
        }
    };
    LineIndex.prototype.walk = function (rangeStart, rangeLength, walkFns) {
        this.root.walk(rangeStart, rangeLength, walkFns);
    };
    LineIndex.prototype.getText = function (rangeStart, rangeLength) {
        var accum = "";
        if ((rangeLength > 0) && (rangeStart < this.root.charCount())) {
            this.walk(rangeStart, rangeLength, {
                goSubtree: true,
                done: false,
                leaf: function (relativeStart, relativeLength, ll) {
                    accum = accum.concat(ll.text.substring(relativeStart, relativeStart + relativeLength));
                }
            });
        }
        return accum;
    };
    LineIndex.prototype.getLength = function () {
        return this.root.charCount();
    };
    LineIndex.prototype.every = function (f, rangeStart, rangeEnd) {
        if (!rangeEnd) {
            rangeEnd = this.root.charCount();
        }
        var walkFns = {
            goSubtree: true,
            done: false,
            leaf: function (relativeStart, relativeLength, ll) {
                if (!f(ll, relativeStart, relativeLength)) {
                    walkFns.done = true;
                }
            }
        };
        this.walk(rangeStart, rangeEnd - rangeStart, walkFns);
        return !walkFns.done;
    };
    LineIndex.prototype.edit = function (pos, deleteLength, newText) {
        function editFlat(source, s, dl, nt) {
            if (nt === void 0) { nt = ""; }
            return source.substring(0, s) + nt + source.substring(s + dl, source.length);
        }
        if (this.root.charCount() === 0) {
            // TODO: assert deleteLength === 0
            if (newText) {
                this.load(LineIndex.linesFromText(newText).lines);
                return this;
            }
        }
        else {
            var checkText = void 0;
            if (this.checkEdits) {
                checkText = editFlat(this.getText(0, this.root.charCount()), pos, deleteLength, newText);
            }
            var walker = new EditWalker();
            if (pos >= this.root.charCount()) {
                // insert at end
                pos = this.root.charCount() - 1;
                var endString = this.getText(pos, 1);
                if (newText) {
                    newText = endString + newText;
                }
                else {
                    newText = endString;
                }
                deleteLength = 0;
                walker.suppressTrailingText = true;
            }
            else if (deleteLength > 0) {
                // check whether last characters deleted are line break
                var e = pos + deleteLength;
                var lineInfo = this.charOffsetToLineNumberAndPos(e);
                if ((lineInfo && (lineInfo.offset === 0))) {
                    // move range end just past line that will merge with previous line
                    deleteLength += lineInfo.text.length;
                    // store text by appending to end of insertedText
                    if (newText) {
                        newText = newText + lineInfo.text;
                    }
                    else {
                        newText = lineInfo.text;
                    }
                }
            }
            if (pos < this.root.charCount()) {
                this.root.walk(pos, deleteLength, walker);
                walker.insertLines(newText);
            }
            if (this.checkEdits) {
                var updatedText = this.getText(0, this.root.charCount());
                //   Debug.assert(checkText == updatedText, "buffer edit mismatch");
            }
            return walker.lineIndex;
        }
    };
    LineIndex.buildTreeFromBottom = function (nodes) {
        var nodeCount = Math.ceil(nodes.length / lineCollectionCapacity);
        var interiorNodes = [];
        var nodeIndex = 0;
        for (var i = 0; i < nodeCount; i++) {
            interiorNodes[i] = new LineNode();
            var charCount = 0;
            var lineCount = 0;
            for (var j = 0; j < lineCollectionCapacity; j++) {
                if (nodeIndex < nodes.length) {
                    interiorNodes[i].add(nodes[nodeIndex]);
                    charCount += nodes[nodeIndex].charCount();
                    lineCount += nodes[nodeIndex].lineCount();
                }
                else {
                    break;
                }
                nodeIndex++;
            }
            interiorNodes[i].totalChars = charCount;
            interiorNodes[i].totalLines = lineCount;
        }
        if (interiorNodes.length === 1) {
            return interiorNodes[0];
        }
        else {
            return this.buildTreeFromBottom(interiorNodes);
        }
    };
    LineIndex.linesFromText = function (text) {
        var lineStarts = computeLineStarts(text);
        if (lineStarts.length === 0) {
            return { lines: [], lineMap: lineStarts };
        }
        var lines = new Array(lineStarts.length);
        var lc = lineStarts.length - 1;
        for (var lmi = 0; lmi < lc; lmi++) {
            lines[lmi] = text.substring(lineStarts[lmi], lineStarts[lmi + 1]);
        }
        var endText = text.substring(lineStarts[lc]);
        if (endText.length > 0) {
            lines[lc] = endText;
        }
        else {
            lines.length--;
        }
        return { lines: lines, lineMap: lineStarts };
    };
    return LineIndex;
}());
exports.LineIndex = LineIndex;
var LineNode = (function () {
    function LineNode() {
        this.totalChars = 0;
        this.totalLines = 0;
        this.children = [];
    }
    LineNode.prototype.isLeaf = function () {
        return false;
    };
    LineNode.prototype.updateCounts = function () {
        this.totalChars = 0;
        this.totalLines = 0;
        for (var i = 0, len = this.children.length; i < len; i++) {
            var child = this.children[i];
            this.totalChars += child.charCount();
            this.totalLines += child.lineCount();
        }
    };
    LineNode.prototype.execWalk = function (rangeStart, rangeLength, walkFns, childIndex, nodeType) {
        if (walkFns.pre) {
            walkFns.pre(rangeStart, rangeLength, this.children[childIndex], this, nodeType);
        }
        if (walkFns.goSubtree) {
            this.children[childIndex].walk(rangeStart, rangeLength, walkFns);
            if (walkFns.post) {
                walkFns.post(rangeStart, rangeLength, this.children[childIndex], this, nodeType);
            }
        }
        else {
            walkFns.goSubtree = true;
        }
        return walkFns.done;
    };
    LineNode.prototype.skipChild = function (relativeStart, relativeLength, childIndex, walkFns, nodeType) {
        if (walkFns.pre && (!walkFns.done)) {
            walkFns.pre(relativeStart, relativeLength, this.children[childIndex], this, nodeType);
            walkFns.goSubtree = true;
        }
    };
    LineNode.prototype.walk = function (rangeStart, rangeLength, walkFns) {
        // assume (rangeStart < this.totalChars) && (rangeLength <= this.totalChars)
        var childIndex = 0;
        var child = this.children[0];
        if (!child)
            return;
        var childCharCount = child.charCount();
        // find sub-tree containing start
        var adjustedStart = rangeStart;
        while (adjustedStart >= childCharCount) {
            this.skipChild(adjustedStart, rangeLength, childIndex, walkFns, CharRangeSection.PreStart);
            adjustedStart -= childCharCount;
            childIndex++;
            child = this.children[childIndex];
            if (!child)
                break;
            childCharCount = child.charCount();
        }
        // Case I: both start and end of range in same subtree
        if ((adjustedStart + rangeLength) <= childCharCount) {
            if (this.execWalk(adjustedStart, rangeLength, walkFns, childIndex, CharRangeSection.Entire)) {
                return;
            }
        }
        else {
            // Case II: start and end of range in different subtrees (possibly with subtrees in the middle)
            if (this.execWalk(adjustedStart, childCharCount - adjustedStart, walkFns, childIndex, CharRangeSection.Start)) {
                return;
            }
            var adjustedLength = rangeLength - (childCharCount - adjustedStart);
            childIndex++;
            child = this.children[childIndex];
            childCharCount = child.charCount();
            while (adjustedLength > childCharCount) {
                if (this.execWalk(0, childCharCount, walkFns, childIndex, CharRangeSection.Mid)) {
                    return;
                }
                adjustedLength -= childCharCount;
                childIndex++;
                child = this.children[childIndex];
                if (!child)
                    break;
                childCharCount = child.charCount();
            }
            if (adjustedLength > 0) {
                if (this.execWalk(0, adjustedLength, walkFns, childIndex, CharRangeSection.End)) {
                    return;
                }
            }
        }
        // Process any subtrees after the one containing range end
        if (walkFns.pre) {
            var clen = this.children.length;
            if (childIndex < (clen - 1)) {
                for (var ej = childIndex + 1; ej < clen; ej++) {
                    this.skipChild(0, 0, ej, walkFns, CharRangeSection.PostEnd);
                }
            }
        }
    };
    LineNode.prototype.charOffsetToLineNumberAndPos = function (lineNumber, charOffset) {
        var childInfo = this.childFromCharOffset(lineNumber, charOffset);
        if (!childInfo.child) {
            return {
                line: lineNumber,
                offset: charOffset,
            };
        }
        else if (childInfo.childIndex < this.children.length) {
            if (childInfo.child.isLeaf()) {
                return {
                    line: childInfo.lineNumber,
                    offset: childInfo.charOffset,
                    text: (childInfo.child).text,
                    leaf: (childInfo.child)
                };
            }
            else {
                var lineNode = (childInfo.child);
                return lineNode.charOffsetToLineNumberAndPos(childInfo.lineNumber, childInfo.charOffset);
            }
        }
        else {
            var lineInfo = this.lineNumberToInfo(this.lineCount(), 0);
            return { line: this.lineCount(), offset: lineInfo.leaf.charCount() };
        }
    };
    LineNode.prototype.lineNumberToInfo = function (lineNumber, charOffset) {
        var childInfo = this.childFromLineNumber(lineNumber, charOffset);
        if (!childInfo.child) {
            return {
                line: lineNumber,
                offset: charOffset
            };
        }
        else if (childInfo.child.isLeaf()) {
            return {
                line: lineNumber,
                offset: childInfo.charOffset,
                text: (childInfo.child).text,
                leaf: (childInfo.child)
            };
        }
        else {
            var lineNode = (childInfo.child);
            return lineNode.lineNumberToInfo(childInfo.relativeLineNumber, childInfo.charOffset);
        }
    };
    LineNode.prototype.childFromLineNumber = function (lineNumber, charOffset) {
        var child;
        var relativeLineNumber = lineNumber;
        var i;
        var len;
        for (i = 0, len = this.children.length; i < len; i++) {
            child = this.children[i];
            var childLineCount = child.lineCount();
            if (childLineCount >= relativeLineNumber) {
                break;
            }
            else {
                relativeLineNumber -= childLineCount;
                charOffset += child.charCount();
            }
        }
        return {
            child: child,
            childIndex: i,
            relativeLineNumber: relativeLineNumber,
            charOffset: charOffset
        };
    };
    LineNode.prototype.childFromCharOffset = function (lineNumber, charOffset) {
        var child;
        var i;
        var len;
        for (i = 0, len = this.children.length; i < len; i++) {
            child = this.children[i];
            if (child.charCount() > charOffset) {
                break;
            }
            else {
                charOffset -= child.charCount();
                lineNumber += child.lineCount();
            }
        }
        return {
            child: child,
            childIndex: i,
            charOffset: charOffset,
            lineNumber: lineNumber
        };
    };
    LineNode.prototype.splitAfter = function (childIndex) {
        var splitNode;
        var clen = this.children.length;
        childIndex++;
        var endLength = childIndex;
        if (childIndex < clen) {
            splitNode = new LineNode();
            while (childIndex < clen) {
                splitNode.add(this.children[childIndex]);
                childIndex++;
            }
            splitNode.updateCounts();
        }
        this.children.length = endLength;
        return splitNode;
    };
    LineNode.prototype.remove = function (child) {
        var childIndex = this.findChildIndex(child);
        var clen = this.children.length;
        if (childIndex < (clen - 1)) {
            for (var i = childIndex; i < (clen - 1); i++) {
                this.children[i] = this.children[i + 1];
            }
        }
        this.children.length--;
    };
    LineNode.prototype.findChildIndex = function (child) {
        var childIndex = 0;
        var clen = this.children.length;
        while ((this.children[childIndex] !== child) && (childIndex < clen))
            childIndex++;
        return childIndex;
    };
    LineNode.prototype.insertAt = function (child, nodes) {
        var childIndex = this.findChildIndex(child);
        var clen = this.children.length;
        var nodeCount = nodes.length;
        // if child is last and there is more room and only one node to place, place it
        if ((clen < lineCollectionCapacity) && (childIndex === (clen - 1)) && (nodeCount === 1)) {
            this.add(nodes[0]);
            this.updateCounts();
            return [];
        }
        else {
            var shiftNode = this.splitAfter(childIndex);
            var nodeIndex = 0;
            childIndex++;
            while ((childIndex < lineCollectionCapacity) && (nodeIndex < nodeCount)) {
                this.children[childIndex] = nodes[nodeIndex];
                childIndex++;
                nodeIndex++;
            }
            var splitNodes = [];
            var splitNodeCount = 0;
            if (nodeIndex < nodeCount) {
                splitNodeCount = Math.ceil((nodeCount - nodeIndex) / lineCollectionCapacity);
                splitNodes = new Array(splitNodeCount);
                var splitNodeIndex = 0;
                for (var i = 0; i < splitNodeCount; i++) {
                    splitNodes[i] = new LineNode();
                }
                var splitNode = splitNodes[0];
                while (nodeIndex < nodeCount) {
                    splitNode.add(nodes[nodeIndex]);
                    nodeIndex++;
                    if (splitNode.children.length === lineCollectionCapacity) {
                        splitNodeIndex++;
                        splitNode = splitNodes[splitNodeIndex];
                    }
                }
                for (var i = splitNodes.length - 1; i >= 0; i--) {
                    if (splitNodes[i].children.length === 0) {
                        splitNodes.length--;
                    }
                }
            }
            if (shiftNode) {
                splitNodes[splitNodes.length] = shiftNode;
            }
            this.updateCounts();
            for (var i = 0; i < splitNodeCount; i++) {
                splitNodes[i].updateCounts();
            }
            return splitNodes;
        }
    };
    // assume there is room for the item; return true if more room
    LineNode.prototype.add = function (collection) {
        this.children[this.children.length] = collection;
        return (this.children.length < lineCollectionCapacity);
    };
    LineNode.prototype.charCount = function () {
        return this.totalChars;
    };
    LineNode.prototype.lineCount = function () {
        return this.totalLines;
    };
    return LineNode;
}());
exports.LineNode = LineNode;
var LineLeaf = (function () {
    function LineLeaf(text) {
        this.text = text;
    }
    LineLeaf.prototype.setUdata = function (data) {
        this.udata = data;
    };
    LineLeaf.prototype.getUdata = function () {
        return this.udata;
    };
    LineLeaf.prototype.isLeaf = function () {
        return true;
    };
    LineLeaf.prototype.walk = function (rangeStart, rangeLength, walkFns) {
        walkFns.leaf(rangeStart, rangeLength, this);
    };
    LineLeaf.prototype.charCount = function () {
        return this.text.length;
    };
    LineLeaf.prototype.lineCount = function () {
        return 1;
    };
    return LineLeaf;
}());
exports.LineLeaf = LineLeaf;
function logServiceTimes(logger, service) {
    function time(name, cb) {
        var start = Date.now();
        var result = null;
        try {
            result = cb();
        }
        catch (error) {
            logger.msg("Error for " + name + ":\n" +
                ("    " + (error.stack || error)));
        }
        logger.msg(name + ": " + (Date.now() - start) + "ms");
        return result;
    }
    return {
        getCompletionsAt: function (fileName, position) {
            return time("getCompletions", function () { return service.getCompletionsAt(fileName, position); });
        },
        getDiagnostics: function (fileName) {
            return time("getDiagnostics", function () { return service.getDiagnostics(fileName); });
        },
        getTemplateReferences: function () {
            return time("getTemplateRefrences", function () { return service.getTemplateReferences(); });
        },
        getDefinitionAt: function (fileName, position) {
            return time("getDefinitionAt", function () { return service.getDefinitionAt(fileName, position); });
        },
        getHoverAt: function (fileName, position) {
            return time("getHoverAt", function () { return service.getHoverAt(fileName, position); });
        },
        getPipesAt: function (fileName, position) {
            return service.getPipesAt(fileName, position);
        }
    };
}
//# sourceMappingURL=editorServices.js.map