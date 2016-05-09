var _ = require('lodash');
var Module = require('module');
var realLoad = Module._load;

function fakeLoad (name, ctx) {
    var module = realLoad(name, ctx);

    var filename = Module._resolveFilename(name, ctx, false);

    // Decorate top-level keys
    _.forEach(module, function (key) {
        if (_.isFunction(module[key])) {
            module[key].__ng_dependency_map_filename = filename;
        }
    });

    // Decorate module
    module.__ng_dependency_map_filename = filename;

    return module;
}

function setup() {
    Module._load = fakeLoad;
}

function reset() {
    Module._load = realLoad;
}

module.exports = {
    setup: setup,
    reset: reset
};
