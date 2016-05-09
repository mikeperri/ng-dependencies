var _ = require('lodash');
var callsites = require('callsites');
var realAngular = global.angular;
var fakeRequire = require('./fakeRequire.js');
var ModuleMap = require('./moduleMap.js');
var FileMap = require('./fileMap.js');
var PROVIDER_TYPES = ModuleMap.prototype.PROVIDER_TYPES;
var fakeAngular;

function FakeAngular(moduleMap, fileMap) {
    this.__moduleMap = moduleMap;
    this.__fileMap = fileMap;
}

FakeAngular.prototype.module = function (moduleName, moduleDependencies) {
    var modulePath = callsites()[1].getFileName();

    this.__moduleMap.addModule(moduleName, modulePath, moduleDependencies);
    this.__fileMap.addModule(moduleName, modulePath);

    return getFakeProviders(this, moduleName, modulePath);
}

FakeAngular.prototype.mock = {};
FakeAngular.prototype.mock.module = function () {
    _.forEach(arguments, function (arg) {
        var testPath = callsites()[1].getFileName();

        this.__moduleMap.addTest(moduleName, testPath);
        this.__fileMap.addTest(moduleName, testPath);
    });
}

function fakeProvider(ctx, providerType, moduleName, modulePath, providerName, fnOrArray) {
    var providerFn;
    var providerDependencies;
    var providerPath;

    if (_.isArray(fnOrArray)) {
        providerFn = _.last(fnOrArray);
        providerDependencies = _.initial(fnOrArray);
    } else if (_.isFunction(fnOrArray)) {
        providerFn = fnOrArray;
        providerDependencies = providerFn.$inject || [];
    }

    providerPath = providerFn.__ng_dependency_map_filename || modulePath;

    ctx.__moduleMap.addProvider(moduleName, providerType, providerName, providerPath, providerDependencies);
    ctx.__fileMap.addProvider(moduleName, providerType, providerName, providerPath);

    return getFakeProviders(ctx, moduleName, modulePath);
}

function getFakeProviders(ctx, moduleName, modulePath) {
    var result = {};

    PROVIDER_TYPES.forEach(function (providerType) {
        result[providerType] = _.partial(fakeProvider, ctx, providerType, moduleName, modulePath);
    });

    return result;
}

function initialize(moduleMap, fileMap) {
    fakeAngular = new FakeAngular(moduleMap, fileMap);
}

function on() {
    fakeRequire.setup();
    global.angular = fakeAngular;
}

function off() {
    fakeRequire.reset();
    global.angular = realAngular;
}

module.exports = {
    initialize: initialize,
    on: on,
    off: off
};
