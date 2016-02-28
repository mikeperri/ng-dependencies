var path = require('path');
var expect = require('chai').expect;
var _ = require('lodash');
var ngRequire = require('../index');

var fixtures = {
    valid: './fixtures/followPath/**/allValid.js',
    moduleNameNotValid: './fixtures/followPath/**/moduleNameNotValid.js'
};

describe('Options test', function () {
    before(function () {
        _.each(fixtures, function (value, key) {
            fixtures[key] = path.resolve(__dirname, value);
        });
    });

    afterEach(function () {
        ngRequire.clean();
    });

    it('should not throw an error if the module name is valid', function () {
        var result = ngRequire.update(fixtures.valid, {
            ensureModuleName: true
        });

        expect(result.success).to.have.length(1);
    });

    it('should throw an error for an incorrect module name', function (done) {
        try {
            ngRequire.update(fixtures.moduleNameNotValid, {
                ensureModuleName: true
            });
        } catch (e) {
            expect(e.message).to.match(/should follow folder path/);
            done();
        }
    });
});
