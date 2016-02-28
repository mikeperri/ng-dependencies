var path = require('path');
var fs = require('fs');
var _ = require('lodash');
var readdirr = require('readdir-recursive');
var globule = require('globule');

var helpers = require('./src/helpers');
var parser = require('./src/parser');

// {File path -> meta} mapping
var meta = {};

// {Module name -> file[]} mapping for fast lookup
var moduleCache = {};

// Shared options
var options = {};

var illegalPathCharRegexp = /<>:\?\*/;
var externalModulesRegexp = /bower_components|node_modules/i;

module.exports = {
    _parse: function (file) {
        if (file in meta) {
            // Skip if not modified
            var stat = fs.lstatSync(file);
            if (+stat.mtime < meta[file].lastUpdated) {
                meta[file].lastUpdated = +new Date();

                return false;
            }
        }

        var content = fs.readFileSync(file).toString();

        try {
            var metaData = parser.parse(content, options);

            if (metaData === undefined) {
                // Not a angular module never check again
                meta[file] = { path: file, angular: false, lastUpdated: +new Date() };
            } else {
                // Add to registry
                meta[file] = _.extend({ path: file, angular: true, lastUpdated: +new Date() }, metaData);
            }

            return meta[file];

        } catch (e) {
            e.message = 'Error in parsing file {0}. {1}'.f(file, e.message);
            throw e;
        }
    },


    /**
     * Update the mapping: moduleName -> filePath
     *
     * @param files Array of file paths or file content
     */
    _update: function (files) {
        var self = this;
        var skipped = [], success = [];

        if (!Array.isArray(files)) {
            files = [ files ];
        }

        // Expand folders
        for (var i = files.length -1 ; i >= 0; i--) {
            var file = files[i];

            if (!fs.existsSync(file)) {
                throw new Error('Can not find file {0}'.f(file));
            }

            var stat = fs.lstatSync(file);
            if (stat.isDirectory()) {
                // Remove the folder
                files.splice(i, 1);

                // Push files
                files = files.concat(readdirr.fileSync(file));
            }
        }

        var results = _.map(files, _.bind(self._updateFile, self));

        return {
            success: _(results).filter({ skipped: false }).map('file').value(),
            skipped: _(results).filter({ skipped: true }).map('file').value()
        };
    },

    _updateFile: function (file) {
        var self = this;
        var metaData = self._parse(file);

        if (metaData === false || !metaData.angular) {
            return {
                skipped: true,
                file: file
            };
        }

        if (!metaData.test) {
            if (!externalModulesRegexp.test(file)) {
                // Do not apply naming check on external modules
                var moduleName = metaData.moduleName;

                // Naming check
                if (options.ensureModuleName) {
                    var expectedModuleName = path.dirname(file).replace(/\//g, '.');

                    if (moduleName && expectedModuleName.indexOf(moduleName) === -1) {
                        throw new Error('Module "' + moduleName + '" should follow folder path for ' + file);
                    }
                }
            }

            // Add to cache
            moduleCache[moduleName] = _.union(moduleCache[moduleName] || [], [ file ]);
        }


        return {
            skipped: false,
            file: file
        };
    },

    getFileDependenciesMap: function () {
        var map = _(meta)
            .filter({ angular: true })
            .keyBy('path')
            .mapValues('dependencies')
            .value();

        return map;
    },

    /**
     * Returns a map of files to dependencies
     * (update must have been called first)
     */
    getModuleFilesMap: function () {
        return moduleCache;
    },

    /**
     * Update the mapping: moduleName -> filePath
     *
     * @param patterns
     * @param updateOptions
     */
    update: function (patterns, updateOptions) {
        var self = this;
        var paths = globule.find(patterns);

        options = _.extend(options, updateOptions);

        return self._update(paths);
    },

    /**
     * Clean cache
     */
    clean: function () {
        meta = {};
        options = {};
        moduleCache = {};
    }
};
