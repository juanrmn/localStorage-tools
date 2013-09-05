/**
 * Cross domain storage.
 * Based on: http://www.nczonline.net/blog/2010/09/07/learning-from-xauth-cross-domain-localstorage/
 * @author Juan Ramón González Hidalgo
 *
 * @param origin Iframe URL
 * @param path Path to iframe html file in origin
 */
function CDStorage(origin, path){
    this._iframe = null;
    this._iframeReady = false;
    this._origin = origin;
    this._path = path;
    this._queue = [];
    this._requests = {};
    this._id = 0;
}

/** 
 * Cross domain storage 
 * 
 */
CDStorage.prototype = {
	constructor: CDStorage,

    init: function(){
        var that = this;

        if(!this._iframe){
            if(window.postMessage && window.JSON && window.localStorage){
                this._iframe = document.createElement("iframe");
                this._iframe.style.cssText = "position:absolute;width:1px;height:1px;left:-9999px;";
                document.body.appendChild(this._iframe);

                if(window.addEventListener){
                    this._iframe.addEventListener("load", function(){ that._iframeLoaded(); }, false);
                    window.addEventListener("message", function(event){ that._handleMessage(event); }, false);
                }else if(this._iframe.attachEvent){
                    this._iframe.attachEvent("onload", function(){ that._iframeLoaded(); }, false);
                    window.attachEvent("onmessage", function(event){ that._handleMessage(event); });
                }
                this._iframe.src = this._origin + this._path;
            }
        }
    },

    getItem: function(key, callback){
    	var request = {
    			id: ++this._id,
    			type: 'get',
                key: key
            },
            data = {
                request: request,
                callback: callback
            };
    	if(jQuery){
    		data.deferred = jQuery.Deferred();
    	}

        if(this._iframeReady){
            this._sendRequest(data);
        }else{
            this._queue.push(data);
        }
        
        if(jQuery){
        	return data.deferred.promise();
        }
    },

    setItem: function(key, value){
    	var request = {
    			id: ++this._id,
    			type: 'set',
                key: key,
                value: value
            },
            data = {
                request: request
            };
    	if(jQuery){
    		data.deferred = jQuery.Deferred();
    	}

        if(this._iframeReady){
            this._sendRequest(data);
        }else{
            this._queue.push(data);
        }
        
        if(jQuery){
        	return data.deferred.promise();
        }
    },

    //private methods
    _sendRequest: function(data){
        if(this._iframe){
            this._requests[data.request.id] = data;
            this._iframe.contentWindow.postMessage(JSON.stringify(data.request), this._origin);
        }
    },

    _iframeLoaded: function(){
        this._iframeReady = true;

        if(this._queue.length){
            for (var i=0, len=this._queue.length; i < len; i++){
                this._sendRequest(this._queue[i]);
            }
            this._queue = [];
        }
    },

    _handleMessage: function(event){
        if(event.origin == this._origin){
            var data = JSON.parse(event.data);
            if(typeof this._requests[data.id].deferred != 'undefined'){
            	this._requests[data.id].deferred.resolve(data.value);
            }
            if(typeof this._requests[data.id].callback == 'function'){
            	this._requests[data.id].callback(data.key, data.value);
            }
            delete this._requests[data.id];
        }
    }
};