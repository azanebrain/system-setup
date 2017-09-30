'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const factory_1 = require("../remotes/factory");
class GitRemote {
    constructor(repoPath, name, url, domain, path, types) {
        this.repoPath = repoPath;
        this.name = name;
        this.url = url;
        this.domain = domain;
        this.path = path;
        this.types = types;
        this.provider = factory_1.RemoteProviderFactory.getRemoteProvider(this.domain, this.path);
    }
}
exports.GitRemote = GitRemote;
//# sourceMappingURL=remote.js.map