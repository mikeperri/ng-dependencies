var path = require('path');
var expect = require('chai').expect;
var _ = require('lodash');
var ngRequire = require('../index');

var fixtures = {
    a: './fixtures/moduleWithTest/a.js',
    aTest: './fixtures/moduleWithTest/a.test.js'
};

var folder = './fixtures/moduleWithTest';

describe('Module with tests', function () {
    before(function () {
        _.each(fixtures, function (value, key) {
            fixtures[key] = path.resolve(__dirname, value);
        });

        folder = path.resolve(__dirname, folder);
    });

    afterEach(function () {
        ngRequire.clean();
    });

    it('should create a file -> dependencies map', function () {
        ngRequire.update(folder);
        var fileDependenciesMap = ngRequire.getFileDependenciesMap();

        expect(fileDependenciesMap[fixtures.a]).to.have.members([ ]);
        expect(fileDependenciesMap[fixtures.aTest]).to.have.members([ 'a' ]);
    });

    it('should create a module -> files map', function () {
        ngRequire.update(folder);
        var moduleFilesMap = ngRequire.getModuleFilesMap();

        expect(moduleFilesMap['a']).to.have.members([ fixtures.a ]);
    });
});
