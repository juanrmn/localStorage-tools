/**
 * Store an item list with a given maximun number of elements in localStorage.
 * @author Juan Ramón González Hidalgo
 *
 * @param opts JSON object with the attribute names:
 *      - max_items Max items stored (default: 100)
 *      - var_name Var name in the local storage space (default: '_items')
 */
function list_storage(opts){

    var max_items = opts.max_items || 100,
        name = opts.var_name || '_items',
        lstorage = {};

    var _items = {}; //Dictionary with (key,value) pairs
    var _qkeys = []; //Key list
    var _meta_name = name + '_ls_meta'; //Name to store _qkeys in the localStorage space

    //Checks localStorage support
    var supported = (function(){
        try{
            return window.JSON && 'localStorage' in window && window['localStorage'] !== null;
        }catch(e){
            return false;
        }
    })();

    //private methods
    
    var _getItem = function(key){
        return localStorage.getItem(key);
    };
    var _setItem = function(key, value){
        try{
            localStorage.setItem(key, value);
        }catch(e){
            //localStorage limit reached!!
        }
    };

    //Public methods

    lstorage.get = function(key){
        if(_qkeys.indexOf(key) != -1){
            return _items[key];
        }else{
            return null;
        }
    };

    lstorage.set = function(key, item){
        if(typeof item === 'undefined'){
            item = '';
        }

        while(_qkeys.length >= max_items){
            oldest_key = _qkeys.shift();
            delete _items[oldest_key];
        }
        if(_qkeys.indexOf(key) != -1){
            delete _qkeys[key];
        }
        _qkeys.push(key);
        _items[key] = item;

        if(supported){
            _setItem(name, JSON.stringify(_items));
            _setItem(_meta_name, JSON.stringify(_qkeys));
        }
    };

    lstorage.del = function(key){
        if(_qkeys.indexOf(key) != -1){
            delete _qkeys[key];
            delete _items[key];
        }

        if(supported){
            _setItem(name, JSON.stringify(_items));
            _setItem(_meta_name, JSON.stringify(_qkeys));
        }
    };

    lstorage.get_all = function(){
        return _items;
    };

    //Init
    if(supported){
        meta = _getItem(_meta_name);
        if(meta != null){
            _qkeys = JSON.parse(meta);
        }
        item_list = _getItem(name);
        if(item_list != null){
            _items = JSON.parse(item_list);
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
