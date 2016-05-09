function AngularError(message) {
    this.message = message;
}

AngularError.prototype = new Error();

function throwModuleRedefinitionError(moduleName, existingPath, newPath) {
    throw new AngularError([
            'Module',
            moduleName,
            'was defined in',
            existingPath,
            'and again in',
            newPath
    ].join(' '));
}
