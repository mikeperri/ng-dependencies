function FileMap() {
    this.map = {};
}

function createEntryIfNotExist(ctx, path) {
    if (!ctx.map[path]) {
        ctx.map[path] = {
            modules: [],
            providers: [],
            tests: []
        };
    }
}

FileMap.prototype.addModule = function (moduleName, modulePath) {
    createEntryIfNotExist(this, modulePath);

    this.map[modulePath].modules.push(moduleName);
}

FileMap.prototype.addProvider = function (moduleName, providerType, providerName, providerPath) {
    // Note that this also handles directives (technically not providers)

    createEntryIfNotExist(this, providerPath);

    this.map[providerPath].providers.push({
        name: providerName,
        module: moduleName
    });
}

FileMap.prototype.addTest = function (moduleName, testPath) {
    createEntryIfNotExist(this, testPath);

    this.map[testPath].tests.push(moduleName);
}

module.exports = FileMap;
