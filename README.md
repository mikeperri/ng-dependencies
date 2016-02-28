# ng-dependency-map
[![Dependency Status](https://gemnasium.com/mikeperri/ng-dependency-map.svg)](https://gemnasium.com/mikeperri/ng-dependency-map)

(Forked from https://github.com/randing89/ngrequire)
(See also: https://github.com/klei/ng-dependencies)

A utility to analyze Angular module dependencies.
It scans files, given by a glob pattern, and builds two maps.
* A map of files to Angular module dependencies
* A map of Angular module names to files

## Standard case
An Angular module definition looks like this:
```javascript
// .../src/myCoolModule.js
angular.module('myCoolModule', [ 'myDependency' ])
    .directive(myDirective)
    .service(myService);
```

The map of files to Angular module dependencies will look like this:
```javascript
{
    '.../src/myCoolModule.js': [ 'myDependency ']
}
```

And the map of module names to files will look like this:
```javascript
{
    'myDependency': [ '.../src/myCoolModule.js' ]
}
```

## Modules across multiple files
Note that passing the second argument to angular.module is what constitutes a module definition.
It's possible to have more files that add providers to an existing module after it's defined.

If you add a file like this:
```javascript
// .../src/myCoolModuleAnotherService.js
angular.module('myCoolModule')
    .service(anotherService);
```

The map of files to dependencies won't change.

The map of module names to files will look like this:
```javascript
{
    'myDependency': [ '.../src/myCoolModule.js', '.../src/myCoolModuleAnotherService.js' ]
}
```

## Use with ngMock
ngMock is also supported. You need to use the full name "angular.mock.module" rather than just "module" (to be safe).
If you add a test file like this:
```javascript
// .../src/myCoolModule.test.js
describe('my cool module', function () {
    beforeEach(function () {
        angular.mock.module('myCoolModule');
    });

    it('should compile the directive', function () {
        ...
    });
});
```

The map of module names to files won't change.

The map of files to dependencies will look like this:
```javascript
{
    '.../src/myCoolModule.js': [ 'myDependency '],
    '.../src/myCoolModule.test.js': [ 'myCoolModule' ]
}
```


# API

## update(moduleSourceBase, options);
- moduleSourceBase: Glob-like file path array. Should contain all your angular modules.
- options: Optional. Set 'ensureModuleName' to true to require all module names to match their folder names.

The update function will keep track of when a file was last updated, so it won't process a file again if it hasn't changed.

```javascript
return {
  success: ['successed file list'],
  skipped: ['skipped file list (due to caching)']
}
```

## clean()
Clean the cache.

## getFileDependenciesMap();
Get a map of files to dependencies.

## getModuleFilesMap()
Get a map of modules to the files they are defined in.
