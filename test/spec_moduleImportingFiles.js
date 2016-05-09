var path = require('path');
var expect = require('chai').expect;
var _ = require('lodash');
var ngDependencyMap = require('../lib/index');

var fixtures = {
    a: './fixtures/moduleImportingFiles/a.js',
    myService: './fixtures/moduleImportingFiles/myService.js',
    myOtherService: './fixtures/moduleImportingFiles/myOtherService.js'
};

var folder = './fixtures/moduleImportingFiles';

describe('Module importing other files', function () {
    before(function () {
        _.each(fixtures, function (value, key) {
            fixtures[key] = path.resolve(__dirname, value);
        });

        folder = path.resolve(__dirname, folder, '*.js');
    });

    it('should create a module -> files map', function () {
        var parser = new ngDependencyMap.ParserInstance();
        var result = parser.parse(folder);
        var moduleMap = result.moduleMap;

        expect(moduleMap.a.path).to.equal(fixtures.a);
        expect(moduleMap.a.factory[0].name).to.equal('myService');
        expect(moduleMap.a.factory[0].path).to.equal(fixtures.myService);

        expect(moduleMap.a.factory[1].name).to.equal('myOtherService');
        expect(moduleMap.a.factory[1].path).to.equal(fixtures.myOtherService);

        expect(moduleMap.a.factory[2].name).to.equal('myLocalService');
        expect(moduleMap.a.factory[2].path).to.equal(fixtures.a);
    });

    it('should create a file -> modules map', function () {
        var parser = new ngDependencyMap.ParserInstance();
        var result = parser.parse(folder);
        var fileMap = result.moduleMap;
    });
});
