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
            declarations = declarations.filter(d => d.from !== importedLib ||
                !tsImport.specifiers.some(s => s.specifier === d.declaration.name));
            if (tsImport.defaultAlias) {
                declarations = declarations.filter(d => !(tsImport.defaultAlias && d.declaration instanceof typescript_parser_1.DefaultDeclaration && d.from === importedLib));
            }
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
    return '/' + PathHelpers_1.toPosix(path_1.relative(rootPath, path_1.normalize(path_1.join(path_1.parse(actualFilePath).dir, library)))).replace(/\/$/, '');
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
        const workspaceExcludes = [
            ...config.resolver.workspaceIgnorePatterns,
            'node_modules/**/*',
            'typings/**/*',
        ];
        const moduleExcludes = config.resolver.moduleIgnorePatterns;
        const searches = [
            vscode_1.workspace.findFiles(new vscode_1.RelativePattern(workspaceFolder, `{${config.resolver.resolverModeFileGlobs.join(',')}}`), new vscode_1.RelativePattern(workspaceFolder, `{${workspaceExcludes.join(',')}}`)),
        ];
        let globs = ['typings/**/*.d.ts'];
        let ignores = [];
        const rootPath = workspaceFolder.uri.fsPath;
        const hasPackageJson = fs_1.existsSync(path_1.join(rootPath, 'package.json'));
        if (rootPath && hasPackageJson) {
            const packageJson = require(path_1.join(rootPath, 'package.json'));
            for (const folder of ['dependencies', 'devDependencies']) {
                if (packageJson[folder]) {
                    globs = globs.concat(Object.keys(packageJson[folder]).map(o => `node_modules/${o}/**/*.d.ts`));
                    ignores = ignores.concat(Object.keys(packageJson[folder]).reduce((all, pkg) => {
                        return all.concat(moduleExcludes.map(exclude => `node_modules/${pkg}/${exclude}`));
                    }, []));
                }
            }
        }
        else {
            ignores.push('node_modules/**/*');
        }
        searches.push(vscode_1.workspace.findFiles(new vscode_1.RelativePattern(workspaceFolder, `{${globs.join(',')}}`), new vscode_1.RelativePattern(workspaceFolder, `{${ignores.join(',')}}`)));
        const uris = yield Promise.all(searches);
        return uris
            .reduce((all, cur) => all.concat(cur), [])
            .map(o => o.fsPath);
    });
}
exports.findFiles = findFiles;
