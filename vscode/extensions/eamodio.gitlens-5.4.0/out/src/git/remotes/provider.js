'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const constants_1 = require("../../constants");
function getNameFromRemoteResource(resource) {
    switch (resource.type) {
        case 'branch': return 'Branch';
        case 'branches': return 'Branches';
        case 'commit': return 'Commit';
        case 'file': return 'File';
        case 'repo': return 'Repository';
        case 'revision': return 'Revision';
        default: return '';
    }
}
exports.getNameFromRemoteResource = getNameFromRemoteResource;
class RemoteProvider {
    constructor(domain, path, name, custom = false) {
        this.domain = domain;
        this.path = path;
        this.custom = custom;
        this._name = name;
    }
    get baseUrl() {
        return `https://${this.domain}/${this.path}`;
    }
    formatName(name) {
        if (this._name !== undefined)
            return this._name;
        return `${name}${this.custom ? ` (${this.domain})` : ''}`;
    }
    splitPath() {
        const index = this.path.indexOf('/');
        return [this.path.substring(0, index), this.path.substring(index + 1)];
    }
    getUrlForRepository() {
        return this.baseUrl;
    }
    _openUrl(url) {
        return __awaiter(this, void 0, void 0, function* () {
            if (url === undefined)
                return undefined;
            return vscode_1.commands.executeCommand(constants_1.BuiltInCommands.Open, vscode_1.Uri.parse(url));
        });
    }
    open(resource) {
        switch (resource.type) {
            case 'branch': return this.openBranch(resource.branch);
            case 'branches': return this.openBranches();
            case 'commit': return this.openCommit(resource.sha);
            case 'file': return this.openFile(resource.fileName, resource.branch, undefined, resource.range);
            case 'repo': return this.openRepo();
            case 'revision': return this.openFile(resource.fileName, resource.branch, resource.sha, resource.range);
        }
    }
    openRepo() {
        return this._openUrl(this.getUrlForRepository());
    }
    openBranches() {
        return this._openUrl(this.getUrlForBranches());
    }
    openBranch(branch) {
        return this._openUrl(this.getUrlForBranch(branch));
    }
    openCommit(sha) {
        return this._openUrl(this.getUrlForCommit(sha));
    }
    openFile(fileName, branch, sha, range) {
        return this._openUrl(this.getUrlForFile(fileName, branch, sha, range));
    }
}
exports.RemoteProvider = RemoteProvider;
//# sourceMappingURL=provider.js.map