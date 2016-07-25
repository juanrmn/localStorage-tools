/**
 * Store a given maximun number of elements in localStorage.
 * @author Juan Ramón González Hidalgo
 *
 * @param opts JSON object with the attribute names:
 *      - maxItems Max items to be stored (default: 100)
 *      - prefix Var name for the elements in the local storage space (default: '')
 *      - storage String I.e: 'localStorage' OR 'sessionStorage' (default: 'localStorage')
 *          Indeed, it can be any window global object which accepts getItem, setItem and removeItem methods.
 */
function limitedStorage(opts){

    var maxItems = opts.maxItems || 100,
        prefix = opts.prefix || '',
        storage = opts.storage || 'localStorage',
        lstorage = {};

    var _qkeys = []; //Key list
    var _meta_name = '_ls_meta_' + prefix; //Name to store _qkeys in the storage space

    //Checks storage support
    var supported = (function(){
        try{
            return window.JSON && storage in window && window[storage] !== null;
        }catch(e){
            return false;
        }
    })();

    //private methods

    var _getItem = function(key){
        return window[storage].getItem(key);
    };
    var _setItem = function(key, value){
        try{
            window[storage].setItem(key, value);
        }catch(e){
            //storage limit reached!!
        }
    };
    var _removeItem = function(key){
        window[storage].removeItem(key);
    };

    //Public methods

    lstorage.getItem = function(key){
        if (supported) {
            return _getItem(prefix + key);
        }
        return null;
    };

    lstorage.setItem = function(key, item){
        if (supported) {
            if (typeof item === 'undefined') {
                item = '';
            }

            while (_qkeys.length >= maxItems) {
                oldest_key = _qkeys.shift();
                _removeItem(prefix + oldest_key);
            }
            if (_qkeys.indexOf(key) !== -1) {
                delete _qkeys[key];
            }
            _qkeys.push(key);
            _setItem(prefix + key, JSON.stringify(item));

            _setItem(_meta_name, JSON.stringify(_qkeys));
        }
    };

    lstorage.removeItem = function(key){
        if (supported) {
            if (_qkeys.indexOf(key) !== -1) {
                delete _qkeys[key];
                _removeItem(prefix + key);
            }

            _setItem(_meta_name, JSON.stringify(_qkeys));
        }
    };

    //Init
    if (supported) {
        meta = _getItem(_meta_name);
        if (meta !== null) {
            _qkeys = JSON.parse(meta) || [];
        }
    };

    return lstorage;
}

//From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf:
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (searchElement /*, fromIndex */ ) {
        'use strict';
        if (this == null) {
            throw new TypeError();
        }
        var n, k, t = Object(this),
            len = t.length >>> 0;

        if (len === 0) {
            return -1;
        }
        n = 0;
        if (arguments.length > 1) {
            n = Number(arguments[1]);
            if (n != n) { // shortcut for verifying if it's NaN
                n = 0;
            } else if (n != 0 && n != Infinity && n != -Infinity) {
                n = (n > 0 || -1) * Math.floor(Math.abs(n));
            }
        }
        if (n >= len) {
            return -1;
        }
        for (k = n >= 0 ? n : Math.max(len - Math.abs(n), 0); k < len; k++) {
            if (k in t && t[k] === searchElement) {
                return k;
            }
        }
        return -1;
    };
};
