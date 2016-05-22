$(function() {

    var SERVER_URL = 'https://webstorage.herokuapp.com';
    var $textarea = $('#text'),
        $form = $('#form');

    function flash_message(selector, text) {
        $(selector).text(text).show();
        setTimeout(function() {$(selector).fadeOut()}, 1000);
    }

    function show_saved_message(hash) {
        flash_message('#msg-saved', 'Saved as ' + hash);
    }

    function show_error(text) {
        flash_message('#msg-error', text);
    }

    function load_from_hash(hash) {
        if (!hash || hash == '#') {
            return;
        }
        hash = hash.slice(1);
        $textarea.val('Loading...');
        console.log('Loading data for ' + hash);
        $.get(SERVER_URL + '/' + hash)
            .done(function(data) {
                console.log('Got data: ' + data);
                $textarea.val(data);
            })
            .fail(function(xhr) {
                show_error('Error loading data: ' + xhr.status);
                $textarea.val('');
                window.location.hash = '';
            });
    }

    window.onhashchange = function() {
        console.log('Hash: ' + window.location.hash);
        load_from_hash(window.location.hash);
    };
    load_from_hash(window.location.hash);

    $('#form').submit(function(evt) {
        evt.preventDefault();

        var text = $textarea.val();
        $.ajax(SERVER_URL,
               {data: text, method: 'POST', contentType: 'text/plain'})

            .done(function(data) {
                window.location.hash = data;
            })
            .fail(function(xhr) {
                show_error('Failed saving data: ' + xhr.status);
            });
    });

});
