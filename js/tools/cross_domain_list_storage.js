/**
 * Store an item list with a given maximun number of elements in "cross domain storage".
 * @author Juan Ramón González Hidalgo
 *
 * @param max_items Max items stored (default: 100)
 * @param name Var name in the shared local storage space (default: '_items')
 * @param storage A cross_domain_storage object (cross_domain_storage.js)
 */
function cross_domain_list_storage(storage, opts){

    var max_items = opts.max_items || 200
        , name = opts.var_name || '_items'
        , cdlstorage = {};

    var _items = {}; //Dictionary with (key,value) pairs
    var _qkeys = []; //Key list
    var _meta_name = this.name + '_ls_meta'; //Name to store _qkeys in the shared localStorage space

    var supported =(function(){
        try{
            return window.JSON && 'localStorage' in window && window['localStorage'] !== null;
        }catch(e){
            return false;
        }
    })();

    //Private methods

    var _init_received = function(meta, item_list){
        if(meta != undefined){
            _qkeys = JSON.parse(meta);
        }
        if(item_list != undefined){
            _items = JSON.parse(item_list);
        }
    }

    var _add_key = function (key){
        while(_qkeys.length >= max_items){
            oldest_key = _qkeys.shift();
        }
        if(_qkeys.indexOf(key) != -1){
            delete _qkeys[key];
        }
        _qkeys.push(key);

        if(supported){
            storage.setItem(_meta_name, JSON.stringify(_qkeys));
        }
    };

    //Public methods

    cdlstorage.ready = function(callback){
        if(supported){
            $.when(
                storage.getItem(_meta_name)
                , storage.getItem(name)
            ).done(function(meta, items){
                _init_received(meta, items);
                if(typeof callback == 'function'){
                    callback();
                }
            });
        }
    }

    cdlstorage.get = function(key){
        if(_qkeys.indexOf(key) != -1){
            return _items[key];
        }else{
            return null;
        }
    };

    cdlstorage.set = function (key, item){
        if(typeof item == 'undefined'){
            _add_key(key);
            return;
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
            storage.setItem(name, JSON.stringify(_items));
            storage.setItem(_meta_name, JSON.stringify(_qkeys));
        }
    };

    cdlstorage.del = function(key){
        if(_qkeys.indexOf(key) != -1){
            delete _qkeys[key];
            delete _items[key];
        }

        if(supported){
            storage.setItem(name, JSON.stringify(_items));
            storage.setItem(_meta_name, JSON.stringify(_qkeys));
        }
    };

    cdlstorage.get_all = function(){
        return _items;
    };

    return cdlstorage;
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
}
