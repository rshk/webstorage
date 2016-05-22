# WebStorage

Proof-of-concept "web storage" API, allowing storing (small) chunks of
information by sha1 hash, for a limited amount of time.

The idea is to allow webapps to store some state without the need for
complex backends.


## See it in action

Live API server: https://webstorage.herokuapp.com/

(Note: accessing the link will return a 405 error as only POST is
allowed on the app root. See documentation below).

Demo app: https://rshk.github.io/webstorage


## Usage

### Save some data

    POST https://webstorage.herokuapp.com/

Data is sent as POST request content.

Javascript example (with jquery):

```javascript
$.ajax(SERVER_URL, {data: text, method: 'POST', contentType: 'text/plain'});
```

The response body contains the sha1 hash at which data was stored.

### Retrieve some data

    GET https://webstorage.herokuapp.com/<data-sha1>

Javascript example:

```javascript
$.get(SERVER_URL + '/' + sha1);
```

## Recipe: keeping track of the sha1

Usually, you'll want to give your users a permalink they can use to
load the app back, using the previously saved state.

Simple enough, you can store the sha1 in the URL "fragment":

```javascript
function update_fragment(sha1) {
    window.location.hash = sha1;
}
```

And retrieve it:

```javascript
function get_fragment() {
    var fragment = window.location.hash;
    if (!fragment) { return ''; }
    return fragment.slice(1);  // Strip leading '#'
}
```
