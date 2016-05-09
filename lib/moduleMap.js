var _ = require('lodash');
var errors = require('./errors.js');

function ModuleMap() {
    this.map = {};
}

ModuleMap.prototype.PROVIDER_TYPES = [
    'directive',
    'value',
    'controller',
    'service',
    'factory',
    'provider'
];

ModuleMap.prototype.addModule = function (moduleName, modulePath, moduleDependencies) {
    createEntryIfNotExist(this, moduleName);

    if (_.isArray(moduleDependencies)) {
        if (this.map[moduleName].dependencies.length === 0) {
            this.map[moduleName].dependencies = moduleDependencies;
            this.map[moduleName].path = modulePath;
        } else {
            // Can't support redefinition of modules, since file loading order is undefined.
            // You probably don't want to be able to do that anyway.
            errors.throwModuleRedefinitionError();
        }
    } else {
        this.map[moduleName].references.push(modulePath);
    }
}

ModuleMap.prototype.addProvider = function (moduleName, providerType, providerName, providerPath, providerDependencies) {
    // Note that this also handles directives (technically not providers)
    createEntryIfNotExist(this, moduleName);

    this.map[moduleName][providerType].push({
        name: providerName,
        path: providerPath,
        dependencies: providerDependencies
    });
}

ModuleMap.prototype.addTest = function (moduleName, testPath) {
    createEntryIfNotExist(this, moduleName);

    this.map[moduleName].tests.push(testPath);
}

function createEntryIfNotExist(ctx, moduleName) {
    if (!ctx.map[moduleName]) {
        ctx.map[moduleName] = {
            dependencies: [],
            path: null,
            references: [],
            tests: []
        };

        ModuleMap.prototype.PROVIDER_TYPES.forEach(function (providerType) {
            ctx.map[moduleName][providerType] = [];
        });
    }
}

module.exports = ModuleMap;
