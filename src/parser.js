var acorn = require('acorn');
var acornWalk = require('acorn/dist/walk');
var _ = require('lodash');

var helpers = require('./helpers');

var ngFuncs = [
    'config',
    'run',
    'directive'
];

var ngProviders = [
    'controller',
    'provider',
    'factory',
    'service',
    'value',
    'constant',
    'decorator',
    'filter',
    'animation'
];

module.exports = {
    /**
     * Returns the callee chain for a given call expression
     *
     * e.g. if node is a call expression for angular.module('someModule', []).controller(function () {})
     * then this function will return the nodes for 'angular', 'module', and 'controller'
     *
     * @param node
     */
    getCalleeChain: function (node) {
        var self = this;

        if (node.type !== 'CallExpression') {
            return false;
        }

        return self._getCalleeChain(node.callee, [ node ]);
    },

    _getCalleeChain: function (node, chain) {
        var self = this;

        if (node.type === 'Identifier') {
            return [ node ];
        } else if (node.type === 'MemberExpression') {
            var callee = node.object.callee;

            if (callee) {
                return self._getCalleeChain(callee, [ node ].concat(chain));
            } else {
                return [ node ].concat(chain);
            }
        } else {
            return [];
        }
    },

    /** Given a chain (returned by the getCalleeChain function), this function will return
     * an array of strings representing the names of the nodes in the chain.
     */
    getChainNames: function (chain) {
        var self = this;
        var names = [];

        chain.forEach(function (node) {
            names = names.concat(self._getNamesFromNode(node));
        });

        return names;
    },

    _getNamesFromNode: function (node) {
        var self = this;
        var names = [];

        if (node.type === 'MemberExpression') {
            names = names.concat(self._getNamesFromNode(node.object));
            names = names.concat(self._getNamesFromNode(node.property));
        } else if (node.type === 'Identifier') {
            names.push(node.name);
        }

        return names;
    },

    getArgsAtIndex: function (chain, index) {
        var node = chain[index];
        return node.arguments || node.object.arguments;
    },

    /**
     * Tests whether a chain (an array of names) starts with a pattern (another array of names).
     *
     * Examples:
     * chainNamesStartWith([ 'angular', 'module', 'controller' ], [ 'angular', 'module' ]) -> true
     * chainNamesStartWith([ 'angular', 'module', 'controller' ], [ 'angular', 'mock', 'module' ]) -> false
     *
     * @param chain Chain to test
     * @param pattern Pattern beginning of chain should match
     */
    chainNamesStartWith: function (chain, pattern) {
        return _.isEqual(chain.slice(0, pattern.length), pattern);
    },

    /**
     * Extract module name and dependencies from a file
     *
     * @param content File content
     * @param options
     *
     * @return mixin { moduleName: [String], test: [Boolean], dependencies: [Array]  }
     */
    parse: function (content, options) {
        var self = this;

        options = options || {};

        var moduleName,
            test,
            dependencies = [];

        var ast = acorn.parse(content, { ecmaVersion: 6, sourceType: 'module' });

        acornWalk.recursive(ast, {}, {
            'CallExpression': function (node, state, c) {
                var nameNode, definitionNode;

                if (node.callee && node.arguments) {
                    var chain = self.getCalleeChain(node);
                    var chainNames = self.getChainNames(chain);

                    if (self.chainNamesStartWith(chainNames, [ 'angular', 'mock', 'module' ])) {
                        dependencies = _.union(dependencies, helpers.extractTestDependency(node));
                        test = true;
                    } else if (self.chainNamesStartWith(chainNames, [ 'angular', 'module' ])) {
                        var args = self.getArgsAtIndex(chain, 1);
                        nameNode = args[0];
                        definitionNode = args[1];

                        if (nameNode && nameNode.type === 'Literal') {
                            moduleName = helpers.extractLiteral(nameNode);
                            test = false;

                            if (definitionNode && definitionNode.type === 'ArrayExpression') {
                                dependencies = _.union(dependencies, helpers.extractDependency(definitionNode));
                            }
                        }
                    } else {
                        if (node.arguments.length) {
                            var calledFns = _.filter(node.arguments, { type: 'FunctionExpression' });
                            calledFns.map(function (n) {
                                c(n.body, state);
                            });

                            var calls = _.filter(node.arguments, { type: 'CallExpression' });
                            calls.map(function (n) {
                                c(n, state);
                            });
                        }
                    }
                }
            }
        });

        if (moduleName || test) {
            return {
                moduleName: moduleName,
                test: test,
                dependencies: dependencies
            };
        }
    }
};
