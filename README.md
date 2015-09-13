localStorage-tools
==================

Some tools to extend the javascript localStorage feature: Cross-domain localStorage, limit the number of elements (avoid infinite growing...)

* **js/tools/cross_domain_storage.js**
  It allows to share values in localStorage between different domains (or subdomains).

* **js/tools/list_storage.js**
  To store a given maximum number of elements in localStorage (avoid infinite growing).

* **js/tools/cross_domain_list_storage.js**
  By using cross_domain_storaje.js, it stores a given maximum number of elements which can be shared between different domains.

**There are some use examples in the index.html file.**

*Notes:*

* *To see the stored values, in Chrome you can go to "Right click->Inspect element->Resources" and unfold the Local Storage tree.*

* *You have to include the [json3](http://bestiejs.github.io/json3/) library to get it working on IE8 and IE9*


cross_domain_storage.js
-----------------------

Cross domain storage based on: http://www.nczonline.net/blog/2010/09/07/learning-from-xauth-cross-domain-localstorage/

You need to put the **crossd_iframe.html** file in your server, and add your domain to the **whitelist** (allowed domains) var in the file.

Initialization function:
* cross_domain_storage({origin:'', path:''});
    * origin The URL where the iframe file is located. i.e: `"http://www.example.com"`
    * path Path to the iframe file in origin. i.e: `"/path/to/iframe.html"`

It returns an object with the following functions:
* getItem(key, callback)
  Request the value asociated to the `key`.
  The callback function will receive two parameters: `key` and `value`.
* setItem(key, value)
  Add or update the value asociated to the `key`.

### Usage example:

```javascript
//If you are testing in your local computer, you can leave the default values in
// the crossd_iframe.html file, then switch the url between "localhost" and "127.0.0.1",
// and see in the localStorage of your browser how it works (see previous Notes).

//Once you've added your domain to the `whitelist` in the crossd_iframe.html:
Storage = cross_domain_storage({origin: "http://www.example.com", path: "/path/to/iframe.html"});

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

If you are using jQuery (>=1.5), also you can use 'promises':

```javascript
Storage = cross_domain_storage({origin: "http://www.example.com", path: "/path/to/iframe.html"});
$.when(
    Storage.getItem('key1')
    , Storage.getItem('key2')
    [, etc...]
).done(function(response_key1, response_key2 [, etc...]){
    //response_key1 contains the value for the key1 ('undefined' if not found)
    //response_key2 contains the value for the key2 ('undefined' if not found)
    //etc...
});
```

list_storage.js
-----------

Stores a given maximum number of elements in localStorage.
It can be used as a dictionary with key-value pairs.

*It's a queue: if the limit is reached, then first in - first out.*
*If a previously present item is added (with `set(key, item)` method), it will be put last in the queue again.*

Initialization function:
* list_storage({max_items: 100, var_name: ''})
  max_items: Max number of items to store (default value is 100)
  var_name: Variable name in the localStorage space

It returns an object with the following functions:
  * set(key, value)
    `value` must be serializable by JSON.stringify method.
  * get(key)
    If `key` does not exists, returns null
  * del(key)
    Delete the item associated with the `key`
  * get_all()
    Returns a copy of the stored dictionary

### Usage example:

```javascript
lstorage = list_storage({max_items: 20, var_name: 'local_1'}); //max: 20 items

//Note that the specified number of max items (20) are smaller
//than the number of keys to store in the following loop (100):
for(var i = 0; i<=100; i++){
    lstorage.set("key-"+i, {'a_tag': 'a value - '+i, 'other_tag': 'other value - '+i});
}

//There must be only the last 20 values
for(var i = 0; i<=100; i++){
    value = lstorage.get("key-"+i);
    if(value != null){
        //you'll need a <div id="results"></div> in your test page...
        document.getElementById('results').innerHTML += "<br/>found: key-"+i+", value: "+JSON.stringify(value);
    }
}
```

cross_domain_list_storage.js
------------------------

Stores a given maximum number of elements which can be shared between different domains.

It uses **jQuery, cross_domain_storage.js and crossd_iframe.html files**.

Initialization function:
* cross_domain_list_storage(storage, {max_items: 100, name: ''})
  The first parameter is a cross_domain_storage object (using cross_domain_storage.js)
  The second parameter is a JSON object with the following attributes:
  * max_items Max items stored (default value is 100)
  * name Var name in the shared local storage space (default: '_items')

It returns an object with the following functions:
  * ready(callback)
    Callback function will be executed when the object is ready to use.
  * set(key, value)
    `value` must be serializable by JSON.stringify method.
  * get(key, callback)
    The callback function will be called with two parameters: `key` and `value`.
    If `key` does not exists, value will be null
  * del(key)
    Delete the item associated with the `key`
  * get_all()
    Returns a copy of the stored dictionary

### Usage example:

```javascript
//Cross Domain Storage Configuration (required cross_domain_storage.js and crossd_iframe.html files).
//Also you have to include your "origin domain" in the whitelist in crossd_iframe.html (in this case would be
// "localhost" or perhaps your computer name or IP if you are doing local testing...):

storage = cross_domain_storage("http://localhost", "/localStorage/crossd_iframe.html");

cdls = cross_domain_list_storage(storage, {max_items: 20, var_name: 'crossD_storage'});

cdls.ready(function(){
    //The value can be a string or JSON object:
    cdls.set("cross_key", {'a_key':'Cross Domain data', 'another_key':'another Cross Domain data...'});

    //...
    var cdvalue = cdls.get("cross_key");
    if(cdvalue != null){
        document.getElementById('results').innerHTML += "<br/><br/>Cross Domain list value: " + JSON.stringify(cdvalue) + "<br/><br/>";
    }
});
```
