/**
 * Store an item list with a given maximun number of elements in localStorage.
 * @author Juan Ramón González Hidalgo
 * 
 * @param max_items Max items stored
 * @param name Var name
 */
function LStorage(max_items, name){

    this.max_items = (typeof max_items !== 'undefined') ? max_items : 100;
    this.name = (typeof name !== 'undefined') ? name : '_items';

    this._items = {};
    this._qkeys = [];
    this._meta_name = this.name + '_lstorage_meta';

    this._check_supports = function(){
        try{
            return window.JSON && 'localStorage' in window && window['localStorage'] !== null;
        }catch(e){
            return false;
        }
    };
    this.supported = this._check_supports();

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
    
    this.add = function (key){
    	while(this._qkeys.length >= this.max_items){
            oldest_key = this._qkeys.shift();
        }
        if(this._qkeys.indexOf(key) != -1){
            this._qkeys.splice(key);
        }
        this._qkeys.push(key);
        
        if(this.supported){
            this._setItem(this.name, JSON.stringify(this._qkeys));
        }
    };

    this.set = function (key, item){
        while(this._qkeys.length >= this.max_items){
            oldest_key = this._qkeys.shift();
            delete this._items[oldest_key];
        }
        if(this._qkeys.indexOf(key) != -1){
            this._qkeys.splice(key);
        }
        this._qkeys.push(key);
        this._items[key] = item;
        
        if(this.supported){
            this._setItem(this.name, JSON.stringify(this._items));
            this._setItem(this._meta_name, JSON.stringify(this._qkeys));
        }
    };

    //private methods
    this._getItem = function(key){
        return localStorage.getItem(key);
    };
    this._setItem = function(key, value){
        try{
            localStorage.setItem(key, value);
        }catch(e){
            //localStorage limit reached!!
        }
    };
    
    //Init
    if(this.supported){
        meta = this._getItem(this._meta_name);
        if(meta != null){
        	this._qkeys = JSON.parse(meta);
        }
        item_list = this._getItem(this.name);
		if(item_list != null){
			this._items = JSON.parse(item_list);
		}
    };
}