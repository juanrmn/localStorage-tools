/**
 * Store an item list with a given maximun number of elements in "cross domain storage".
 * @author Juan Ramón González Hidalgo
 * 
 * @param max_items Max items stored
 * @param name Var name
 * @param storage A CDStorage instance (cross_domain_storage.js)
 */
function CDLStorage(max_items, name, storage){

    this.max_items = (typeof max_items !== 'undefined') ? max_items : 200;
    this.name = (typeof name !== 'undefined') ? name : '_items';

    this._items = {};
    this._qkeys = [];
    this._meta_name = this.name + '_lstorage_meta';

    this.storage = storage;

    this._check_supports = function(){
        try{
            return window.JSON && 'localStorage' in window && window['localStorage'] !== null;
        }catch(e){
            return false;
        }
    };
    this._supports = this._check_supports();
    
    this.ready = function(callback){
    	var that = this;

        $.when(
        	this.storage.init()
        	, this.storage.getItem(this._meta_name)
        	, this.storage.getItem(this.name)
        ).done(function(init, meta, items){
        	that.init_received(meta, items);
        	callback();
        });
    }
    this.init_received = function(meta, item_list){
    	if(meta != undefined){
    		this._qkeys = JSON.parse(meta);
    	}
    	if(item_list != undefined){
    		this._items = JSON.parse(item_list);
    	}
    }
    
    this.get = function(key){
        if(this._qkeys.indexOf(key) != -1){
            return this._items[key];
        }else{
            return null;
        }
    };

    this.exists = function (key){
        return (this._qkeys.indexOf(key) != -1);
    };

    this.set = function (key, item){
    	if(item == undefined){
    		this._add_key(key);
    		return;
    	}
        while(this._qkeys.length >= this.max_items){
            oldest_key = this._qkeys.shift();
            delete this._items[oldest_key];
        }
        if(this._qkeys.indexOf(key) != -1){
            this._qkeys.splice(key);
        }
        this._qkeys.push(key);
        this._items[key] = item;
        
        if(this._supports){
        	this.storage.setItem(this.name, JSON.stringify(this._items));
        	this.storage.setItem(this._meta_name, JSON.stringify(this._qkeys));
        }
    };
    
    this._add_key = function (key){
        while(this._qkeys.length >= this.max_items){
            oldest_key = this._qkeys.shift();
        }
        if(this._qkeys.indexOf(key) != -1){
            this._qkeys.splice(key);
        }
        this._qkeys.push(key);
        
        if(this._supports){
        	this.storage.setItem(this.name, JSON.stringify(this._qkeys));
        }
    };
}