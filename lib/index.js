var glob = require('glob');
var fakeAngular = require('./fakeAngular.js');
var ModuleMap = require('./moduleMap.js');
var FileMap = require('./fileMap.js');

function ParserInstance() {
    if (!this instanceof ParserInstance) {
        return new ParserInstance();
    }

    this.reset();
    fakeAngular.initialize(this.moduleMap, this.fileMap);
}

ParserInstance.prototype.reset = function () {
    this.moduleMap = new ModuleMap();
    this.fileMap = new FileMap();
}

ParserInstance.prototype.parse = function (globPattern, callback) {
    fakeAngular.on();

    glob.sync(globPattern).forEach(function (file) {
        if (require.cache[file]) {
            delete require.cache[file];
        }
        require(file);
    });

    fakeAngular.off();

    return {
        moduleMap: this.moduleMap.map,
        fileMap: this.fileMap.map
    };
}

module.exports = {
    ParserInstance: ParserInstance
};
