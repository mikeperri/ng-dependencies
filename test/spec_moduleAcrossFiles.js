var path = require('path');
var expect = require('chai').expect;
var _ = require('lodash');
var ngRequire = require('../index');

var fixtures = {
    a1:'./fixtures/moduleAcrossFiles/a1.js',
    a2:'./fixtures/moduleAcrossFiles/a2.js',
    a3:'./fixtures/moduleAcrossFiles/a3.js'
};

var folder = './fixtures/moduleAcrossFiles';

describe('Module split across multiple files', function () {
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

        expect(fileDependenciesMap[fixtures.a1]).to.have.members([ ]);
    });

    it('should create a module -> files map', function () {
        ngRequire.update(folder);
        var moduleFilesMap = ngRequire.getModuleFilesMap();

        expect(moduleFilesMap['a']).to.have.members([ fixtures.a1, fixtures.a2, fixtures.a3 ]);
    });
});
