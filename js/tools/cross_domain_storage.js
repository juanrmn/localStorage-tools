/**
 * Cross domain storage.
 * Based on: http://www.nczonline.net/blog/2010/09/07/learning-from-xauth-cross-domain-localstorage/
 * @author Juan Ramón González Hidalgo
 *
 * @param origin Iframe URL
 * @param path Path to iframe html file in origin
 */
function CDStorage(origin, path){
    var _iframe = null;
    var _iframeReady = false;
    var _origin = origin;
    var _path = path;
    var _queue = [];
    var _requests = {};
    var _id = 0;
    
    var supported = (function(){
        try{
            return window.postMessage && window.JSON && 'localStorage' in window && window['localStorage'] !== null;
        }catch(e){
            return false;
        }
    })();

    //private methods
    var _sendRequest = function(data){
        if(_iframe){
            _requests[data.request.id] = data;
            _iframe.contentWindow.postMessage(JSON.stringify(data.request), _origin);
        }
    };

    var _iframeLoaded = function(){
        _iframeReady = true;
        if(_queue.length){
            for (var i=0, len=_queue.length; i < len; i++){
                _sendRequest(_queue[i]);
            }
            _queue = [];
        }
    };

    var _handleMessage = function(event){
        if(event.origin == _origin){
            var data = JSON.parse(event.data);
            if(typeof _requests[data.id].deferred != 'undefined'){
                _requests[data.id].deferred.resolve(data.value);
            }
            if(typeof _requests[data.id].callback == 'function'){
                _requests[data.id].callback(data.key, data.value);
            }
            delete _requests[data.id];
        }
    }

    //Public methods

    this.getItem = function(key, callback){
        if(supported){
            var request = {
                    id: ++_id,
                    type: 'get',
                    key: key
                },
                data = {
                    request: request,
                    callback: callback
                };
            if(window.jQuery){
                data.deferred = jQuery.Deferred();
            }
    
            if(_iframeReady){
                _sendRequest(data);
            }else{
                _queue.push(data);
            }
            
            if(window.jQuery){
                return data.deferred.promise();
            }
        }
    };

    this.setItem = function(key, value){
        if(supported){
            var request = {
                    id: ++_id,
                    type: 'set',
                    key: key,
                    value: value
                },
                data = {
                    request: request
                };
            if(window.jQuery){
                data.deferred = jQuery.Deferred();
            }
    
            if(_iframeReady){
                _sendRequest(data);
            }else{
                _queue.push(data);
            }
            
            if(window.jQuery){
                return data.deferred.promise();
            }
        }
    };

    //Init
    if(!_iframe && supported){
        _iframe = document.createElement("iframe");
        _iframe.style.cssText = "position:absolute;width:1px;height:1px;left:-9999px;";
        document.body.appendChild(_iframe);

        if(window.addEventListener){
            _iframe.addEventListener("load", function(){ _iframeLoaded(); }, false);
            window.addEventListener("message", function(event){ _handleMessage(event) }, false);
        }else if(_iframe.attachEvent){
            _iframe.attachEvent("onload", function(){ _iframeLoaded(); }, false);
            window.attachEvent("onmessage", function(event){ _handleMessage(event) });
        }
        _iframe.src = _origin + _path;
    }
}