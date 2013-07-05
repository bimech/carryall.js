/**
 * Carryall: A conditional, self-contained, lazily-evaluating script loader.
 * Author: Frank O'Hara, bimech.net
 * Version: 0.1.2
 */

var Carryall = (function() {
    // Variables
    var _cargo = {};
    var _manifest = [];
    var _manifestKeys = {'name': true, 'check': true, 'checkPassed': true, 'checkFailed': true};
    var _cargoKeys = {'name': true, 'payload': true};

    // Domain functions
    var _pickCargoPayload = function(cargoName) {
        if(cargoName in _cargo) {
            return _cargo[cargoName];
        }
        else {
            throw new CargoNotFound("The following cargo could not be found: '" + cargoName + "'. Delivery aborted.");
        }
    };
    var _packCargo = function(cargo) {
        for(var i = 0; i < cargo.length; i++) {
            var cargoItem = cargo[i];
            _cargo[cargoItem.name] = cargoItem.payload;
        }
    };
    var _unpackCargo = function(cargoNames) {
        for(var i = 0; i < cargoNames.length; i++) {
            var payload = _pickCargoPayload(cargoNames[i]);
            try {
                eval(payload);
            }
            catch (e) {
                throw new CorruptCargo("The following cargo is corrupt: '" + cargoNames[i] +"'. Delivery aborted.");
            }
        }
    };
    var _detectValidCargo = function(cargoItem) {
        _detectValidArrayElements(cargoItem, 'cargo');
    }
    var _detectValidManifest = function(manifest) {
        _detectValidArrayElements(manifest, 'manifest');
    };
    var _detectValidPostCheckAction = function(postCheckObject) {
        if(postCheckObject instanceof Array) {
            for(var i = 0; i < postCheckObject.length; i++) {
                if(typeof postCheckObject[i] != 'string') {
                    throw new InvalidPostCheckFormat("Cargo names must be specified as type 'String' when using 'checkPassed' and/or 'checkFailed'.");
                }
            }
        }
        else {
            throw new InvalidPostCheckFormat("An array of cargo names must be specified when using 'checkPassed' and/or 'checkFailed'.");
        }
    };
    var _hasCheck = function(manifestItem) {
        return 'check' in manifestItem;
    };
    var _performCheck = function(manifestItem) {
        var checkType = typeof manifestItem.check;
        switch(checkType) {
            case 'boolean':
                return manifestItem.check;
                break;
            case 'function':
                return manifestItem.check();
                break;
            case 'string':
                return _performEvalCheck(manifestItem.check);
                break;
        }
    };
    var _performEvalCheck = function(checkStr) {
        var evalCheck = eval('[' + checkStr + ']')[0];
        return typeof evalCheck == 'function' ? evalCheck() : evalCheck;
    }
    var _performChecks = function(manifest) {
        for(var i = 0; i < manifest.length; i++) {
            if(_hasCheck(manifest[i])) {
                var checkResult = _performCheck(manifest[i]);
                if(checkResult && 'checkPassed' in manifest[i]) {
                    _detectValidPostCheckAction(manifest[i]['checkPassed']);
                    _unpackCargo(manifest[i]['checkPassed']);
                }
                else if(!checkResult && 'checkFailed' in manifest[i]) {
                    _unpackCargo(manifest[i]['checkFailed']);
                }
            }
        }
    };
    var _deliver = function(manifest, cargo) {
        _detectValidManifest(manifest);
        _detectValidCargo(cargo);
        _manifest = manifest;
        _packCargo(cargo);
        _performChecks(manifest);
    };

    // Helper functions
    var _getKeys = function(obj){
        var keys = [];
        for(var key in obj){
            keys.push(key);
        }
        return keys;
    };
    var _detectValidArrayElements = function(object, elementType) {
        if(object instanceof Array) {
            for(var i = 0; i < object.length; i++) {
                var keys = _getKeys(object[i]);
                for(var j = 0; j < keys.length; j++) {
                    if(!(keys[j] in _getValidKeys(elementType))) {
                        var exception = _getExceptionType(elementType);
                        throw new exception('A ' + elementType + ' item has the following invalid key: ' + keys[j]);
                    }
                }
            }
        }
        else {
            throw new InvalidManifestFormat('The Caryall ' + elementType + ' must be an array.');
        }
    };
    var _getValidKeys = function(elementType) {
        switch(elementType) {
            case 'manifest':
                return _manifestKeys;
                break;
            case 'cargo':
                return _cargoKeys;
                break;
        }

    };
    var _getExceptionType = function(exceptionType) {
        switch(exceptionType) {
            case 'manifest':
                return InvalidManifestFormat;
                break;
            case 'cargo':
                return InvalidCargoFormat;
                break;
        }
    };

    // Exceptions
    function InvalidManifestFormat(message) {
        this.message = message;
        this.name = 'InvalidManifestFormat';
        this.toString = function() {
            return this.message;
        }
    }
    function InvalidCargoFormat(message) {
        this.message = message;
        this.name = 'InvalidCargoFormat';
        this.toString = function() {
            return this.message;
        }
    }
    function InvalidPostCheckFormat(message) {
        this.message = message;
        this.name = 'InvalidPostCheckFormat';
        this.toString = function() {
            return this.message;
        }
    }
    function CorruptCargo(message) {
        this.message = message;
        this.name = 'CorruptCargo';
        this.toString = function() {
            return this.message;
        }
    }
    function CargoNotFound(message) {
        this.message = message;
        this.name = 'CargoNotFound';
        this.toString = function() {
            return this.message;
        }
    }

    // Public functions
    return {
        deliver: _deliver
    }

})();