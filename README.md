localStorage-tools
==================

Some tools to extend the javascript localStorage feature: Cross-domain localStorage and limit the number of elements (avoid infinite growing)

* **src/crossDomainStorage.js**
  It allows to share values in localStorage or sessionStorage between different domains (or subdomains).

* **src/limitedStorage.js**
  To store a given maximum number of elements in localStorage or sessionStorage (avoid infinite growing).

**There are some use examples in the index.html file.**

*Notes:*

* *To see the stored values, in Chrome you can go to "F12 -> Application" and unfold the Local Storage tree.*

* *You have to include the [json3](http://bestiejs.github.io/json3/) library to get it working on IE8 and IE9*


crossDomainStorage.js
-----------------------

Cross domain storage based on: http://www.nczonline.net/blog/2010/09/07/learning-from-xauth-cross-domain-localstorage/

You need to put the **crossd_iframe.html** file in your server, and add your domain to the **whitelist** (allowed domains) var in the file.

Initialization function:
* crossDomainStorage({origin:'', path:'', storage});
    * origin The URL where the iframe file is located. i.e: `"http://www.example.com"`
    * path Path to the iframe file in origin. i.e: `"/path/to/iframe.html"`
    * storage: Possible values are 'localStorage' and 'sessionStorage' (default 'localStorage')

It returns an object with the following functions:
* getItem(key, callback)
  Request the value associated to the `key`.
  The callback function will receive two parameters: `key` and `value`.
* setItem(key, value)
  Add or update the value associated to the `key`.
* removeItem(key)
  Removes the item associated to the `key`.

### Usage example:

```javascript
//If you are testing in your local computer, you can leave the default values in
// the crossd_iframe.html file, then switch the url between "localhost" and "127.0.0.1",
// and see in the localStorage of your browser how it works (see previous Notes).

//Once you've added your domain to the `whitelist` in the crossd_iframe.html:
var options = {
    origin: "http://www.example.com",
    path: "/path/to/iframe.html"
};
Storage = crossDomainStorage(options);

//...
Storage.setItem('key', 'value');

//...
Storage.getItem('key', function(key, value) {
  //if key was not present, value will be 'undefined'
  if (value !== 'undefined') {
        //...
    } else {
        //key not found...
    }
});

```

If you are using jQuery (>=1.5), also you can use 'promises':

```javascript
Storage = crossDomainStorage(options);
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

limitedStorage.js
-----------

Stores a given maximum number of elements in localStorage or sessionStorage.
It has the same methods than the localStorage and sessionStorage objects (getItem, setItem and removeItem), so it can be used the same way, taking into account that older objecsts will be deleted when the given limit is reached.

*It's a queue: if the limit is reached, then first in - first out.*
*If a previously present item is added (with `setItem(key, item)` method), it will be put last in the queue again.*

Initialization function:
* limitedStorage({maxItems: 100, prefix: '', storage: 'localStorage'})
  maxItems: Max number of items to store (default value is 100)
  prefix: Variable name prefix in the storage space (default none)
  storage: Possible values are 'localStorage' and 'sessionStorage' (default 'localStorage')

It returns an object with the following functions:
  * setItem(key, value)
    `value` must be serializable by JSON.stringify method.
  * getItem(key)
    If `key` does not exists, returns null
  * removeItem(key)
    Delete the item associated with the `key`

### Usage example:

```javascript
lstorage = limitedStorage({maxItems: 20, prefix: '_test_'}); //max: 20 items

//Note that the specified number of max items (20) are smaller
//than the number of keys to store in the following loop (100):
for (var i = 0; i<=100; i++) {
    lstorage.setItem("key-"+i, {'a_tag': 'a value - '+i, 'other_tag': 'other value - '+i});
}

//There must be only the last 20 values
for (var i = 0; i<=100; i++) {
    value = lstorage.getItem("key-"+i);
    if (value !== null) {
        //you'll need a <div id="results"></div> in your test page...
        document.getElementById('results').innerHTML += "<br/>found: key-"+i+", value: "+JSON.stringify(value);
    }
}
```
