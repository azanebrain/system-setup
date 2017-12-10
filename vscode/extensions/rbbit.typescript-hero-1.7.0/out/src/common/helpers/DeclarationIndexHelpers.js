"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs_1 = require("fs");
const path_1 = require("path");
const typescript_parser_1 = require("typescript-parser");
const PathHelpers_1 = require("typescript-parser/utilities/PathHelpers");
const vscode_1 = require("vscode");
function getDeclarationsFilteredByImports(declarationInfos, documentPath, imports, rootPath) {
    let declarations = declarationInfos;
    for (const tsImport of imports) {
        const importedLib = getAbsolutLibraryName(tsImport.libraryName, documentPath, rootPath);
        if (tsImport instanceof typescript_parser_1.NamedImport) {
            declarations = declarations.filter(o => o.from !== importedLib ||
                !tsImport.specifiers.some(s => s.specifier === o.declaration.name));
        }
        else if (tsImport instanceof typescript_parser_1.NamespaceImport || tsImport instanceof typescript_parser_1.ExternalModuleImport) {
            declarations = declarations.filter(o => o.from !== tsImport.libraryName);
        }
    }
    return declarations;
}
exports.getDeclarationsFilteredByImports = getDeclarationsFilteredByImports;
function getAbsolutLibraryName(library, actualFilePath, rootPath) {
    if (!library.startsWith('.') || !rootPath) {
        return library;
    }
    return '/' + PathHelpers_1.toPosix(path_1.relative(rootPath, path_1.normalize(path_1.join(path_1.parse(actualFilePath).dir, library)))).replace(/[/]$/g, '');
}
exports.getAbsolutLibraryName = getAbsolutLibraryName;
function getRelativeLibraryName(library, actualFilePath, rootPath) {
    if (!library.startsWith('/') || !rootPath) {
        return library;
    }
    const actualDir = path_1.parse('/' + path_1.relative(rootPath, actualFilePath)).dir;
    let relativePath = path_1.relative(actualDir, library);
    if (!relativePath.startsWith('.')) {
        relativePath = './' + relativePath;
    }
    else if (relativePath === '..') {
        relativePath += '/';
    }
    return PathHelpers_1.toPosix(relativePath);
}
exports.getRelativeLibraryName = getRelativeLibraryName;
function findFiles(config, workspaceFolder) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const searches = [
            vscode_1.workspace.findFiles(new vscode_1.RelativePattern(workspaceFolder, `{${config.resolver.resolverModeFileGlobs.join(',')}}`), new vscode_1.RelativePattern(workspaceFolder, '{**/node_modules/**,**/typings/**}')),
        ];
        let globs = [];
        let ignores = ['**/typings/**'];
        const excludePatterns = config.resolver.ignorePatterns;
        const rootPath = workspaceFolder.uri.fsPath;
        if (rootPath && fs_1.existsSync(path_1.join(rootPath, 'package.json'))) {
            const packageJson = require(path_1.join(rootPath, 'package.json'));
            if (packageJson['dependencies']) {
                globs = globs.concat(Object.keys(packageJson['dependencies']).filter(o => excludePatterns.indexOf(o) < 0)
                    .map(o => `**/node_modules/${o}/**/*.d.ts`));
                ignores = ignores.concat(Object.keys(packageJson['dependencies']).filter(o => excludePatterns.indexOf(o) < 0)
                    .map(o => `**/node_modules/${o}/node_modules/**`));
            }
            if (packageJson['devDependencies']) {
                globs = globs.concat(Object.keys(packageJson['devDependencies']).filter(o => excludePatterns.indexOf(o) < 0)
                    .map(o => `**/node_modules/${o}/**/*.d.ts`));
                ignores = ignores.concat(Object.keys(packageJson['devDependencies']).filter(o => excludePatterns.indexOf(o) < 0)
                    .map(o => `**/node_modules/${o}/node_modules/**`));
            }
        }
        else {
            globs.push('**/node_modules/**/*.d.ts');
        }
        searches.push(vscode_1.workspace.findFiles(new vscode_1.RelativePattern(workspaceFolder, `{${globs.join(',')}}`), new vscode_1.RelativePattern(workspaceFolder, `{${ignores.join(',')}}`)));
        searches.push(vscode_1.workspace.findFiles(new vscode_1.RelativePattern(workspaceFolder, '**/typings/**/*.d.ts'), new vscode_1.RelativePattern(workspaceFolder, '**/node_modules/**')));
        let uris = yield Promise.all(searches);
        uris = uris.map((o, idx) => idx === 0 ?
            o.filter(f => f.fsPath
                .replace(rootPath || '', '')
                .split(/\\|\//)
                .every(p => excludePatterns.indexOf(p) < 0)) :
            o);
        return uris.reduce((all, cur) => all.concat(cur), []).map(o => o.fsPath);
    });
}
exports.findFiles = findFiles;
