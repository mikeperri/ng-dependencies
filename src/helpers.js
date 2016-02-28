var _ = require('lodash');
var path = require('path');

module.exports = {
    extractLiteral: function (node) {
        var line = node.start.line;

        if (node.type === 'Literal') {
            return node.value;
        }
    },

    extractDependency: function (node) {
        var self = this;
        var line = node.start.line;

        if (node.type === 'ArrayExpression') {
            var elements = node.elements;
            return _.transform(elements, function (result, element, index) {
                if (element.type === 'Literal') {
                    result.push(element.value);

                } else if (element.type === 'FunctionExpression') {
                    _.each(self.extractDependency(element), function (name, index) {
                        // Skip first N arguments
                        if (index >= result.length && !name.startsWith('$')) {
                            result.push(name);
                        }
                    });
                }
            });

        } else if (node.type === 'FunctionExpression') {
            // Extract arguments
            return _.transform(node.params, function (result, param) {
                if (!param.name.startsWith('$')) {
                    result.push(param.name);
                }
            });
        }

        // Ignore all others
    },

    extractTestDependency: function (node) {
        var self = this;
        var line = node.start.line;
        var modules = _(node.arguments)
            .filter({ 'type': 'Literal' })
            .map('value').value();

        return modules;
    },

    isString: function (obj) {
        return Object.prototype.toString.call(obj) === '[object String]';
    },

    isRegexp: function (obj) {
        return Object.prototype.toString.call(obj) === '[object RegExp]';
    }
};
