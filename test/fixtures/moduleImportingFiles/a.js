var ambiguousVariableName = require('./myService');
var anotherAmbiguousVariableName = require('./myOtherService');

angular.module('a', [])
    .factory('myService', ambiguousVariableName)
    .factory('myOtherService', anotherAmbiguousVariableName)
    .factory('myLocalService', function () {});
