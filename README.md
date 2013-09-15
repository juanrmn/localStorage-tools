localStorage-tools
==================

Some tools to extend the javascript localStorage feature: Cross-domain localStorage, limit the number of elements (avoid infinite growing...)

* **js/tools/cross_domain_storage.js**
  It allows to share values in localStorage between different domains (or subdomains).
  
* **js/tools/lstorage.js**
  To store item lists with a given maximun number of elements in localStorage (avoid infinite growing).
  
* **js/tools/cross_domain_lstorage.js**
  By using cross_domain_storaje.js, it stores item lists with a given maximun number of elements which can be shared between different domains.

**There are some use examples in the index.html file.**

*Note:*

*In order to see the stored values, in Chrome you can go to "Right click->Inspect element->Resources" and unfold the Local Storage tree.*


cross_domain_storage.js
-----------------------

Cross domain storage based on: http://www.nczonline.net/blog/2010/09/07/learning-from-xauth-cross-domain-localstorage/

You need to put the **crossd_iframe.html** in your server, and add your domain to the **whitelist** (allowed domains) var in the file.

Constructor:
* CDStorage(origin, path);
    * origin The URL where the iframe file is located. i.e: `"http://www.example.com"`
    * path Path to the iframe file in origin. i.e: `"/path/to/iframe.html"`
 
Functions:
* getItem(key, callback)
  Request the value asociated to 'key'.
  The callback function must receive `key` and `value` parameters.
* setItem(key, value)
  Set the value asociated to 'key'.

### Usage example: 
  
```javascript
//Once you've added your domain to the `whitelist` in the crossd_iframe.html:
Storage = new CDStorage("http://www.example.com", "/path/to/iframe.html");
Storage.init();
//...
Storage.setItem('key', 'value');
//...
Storage.getItem('key', callback_function);

function callback_function(key, value){
    //if key was not present, value will be 'undefined'
	if(value != 'undefined'){
        //...
    }else{
        //key not found...
    }
}
```
     
If you are using jQuery (>=1.5), also you can do:

```javascript
Storage = new CDStorage("http://www.example.com", "/path/to/iframe.html");
$.when(
    Storage.init()
    , Storage.getItem('key1')
    , Storage.getItem('key2')
    [, etc...]
).done(function(response_init, response_key1, response_key2 [, etc...]){
    //response_key1 contains the value for the key1 ('undefined' if not found)
    //response_key2 contains the value for the key2 ('undefined' if not found)
    //etc...
});
```

lstorage.js
-----------

Store item lists with a given maximun number of elements in localStorage.

*It's a queue: if the limit is reached, then first in - first out.*
*If a previously present item is added (with either `set(key, item)` or `add(key)` methods), it will be put last in the queue again.*

Constructor:
* LStorage(max_items, var_name)
  max_items Max number of items to store
  var_name Var name in localStorage

It can be used as:
* a dictionary with key-value pairs. **Functions**: 
    * set(key, value)
      `value` must be serializable by JSON.stringify method.
    * get(key)
       If `key` does not exists, returns null
       
* an item list. **Functions**:
    * add(item)
      Add `item` to the list.
    * exists(item)
      Returns true if `item` is in the list.
      
### Usage example:

```javascript
ls1 = new LStorage(20, 'local_1');
ls2 = new LStorage(500, 'local_2');

//Note that the specified number of items (20 and 500) are smaller 
//than the number of keys to store (100 and 1000 respectively)
for(var i = 0; i<=100; i++)
    ls1.set("key-"+i, {'val': 'value'+i});
			    
for(var i = 0; i<=100; i++){
    value = ls1.get("key-"+i);
    if(value){
        //you'll need a <div id="results"></div> in your test page...
        document.getElementById('results').innerHTML += "<br/>found: key-"+i+", value: "+JSON.stringify(value);
    }
}
			
//a simple list...
for(var i = 0; i<=1000; i++)
    ls2.add("values_"+i);
			    
for(var i = 0; i<=1000; i++){
    if(ls2.exists("values_"+i))
        document.getElementById('results').innerHTML += "<br/>found: key-"+i;
}
```

cross_domain_lstorage.js
------------------------

Store item lists with a given maximun number of elements which can be shared between different domains.

It uses **jQuery, cross_domain_storage.js and crossd_iframe.html files**.

### Usage example:

```javascript
//Cross Domain Storage Configuration (required cross_domain_storage.js and crossd_iframe.html files).
//Also you have to include your "origin domain" in the whitelist in crossd_iframe.html (in this case would be
// "localhost" or perhaps your computer name if you are doing local testing...):
storage = new CDStorage("http://localhost", "/localStorage/crossd_iframe.html");

cdls1 = new CDLStorage(5, 'crossD_storage', storage);
cdls2 = new CDLStorage(20, 'crossD_storage_2', storage);

cdls1.ready(function(){
    cdls1.set("cross_key", {'a_key':'Cross Domain Data Stored!!! :D', 'another_key':'yea'});

    if(cdls1.exists("cross_key")){
        value = cdls1.get("cross_key");
        //you'll need a <div id="results"></div> in your test page...
        document.getElementById('results').innerHTML += "<br/>cros_key: " + JSON.stringify(value);
    }
});

cdls2.ready(function(){
    for(var i = 0; i&lt;=1000; i++){
        cdls2.set("cross_list-"+i);
    }
    //...
});
//...
cdls2.ready(function(){
    for(var i = 0; i<=1000; i++){
	if(cdls2.exists("cross_list-"+i))
	    document.getElementById('results').innerHTML += "<br/>found: cross_list-"+i;
    }
});
```

