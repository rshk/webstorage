$(function() {

    var SERVER_URL = 'https://webstorage.herokuapp.com';
    var $textarea = $('#text'),
        $form = $('#form'),
        $save_button = $('#save-button'),
        $messages = $('#messages');

    function flash_message(level, text) {
        var $el = $('<div>').attr('class', 'alert alert-' + level).html(text);
        $messages.append($el);
        setTimeout(function() { $el.fadeOut(); }, 2000);
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
            .fail(function(xhr, msg, error) {
                flash_message('danger', 'Error loading data: ' + xhr.status +
                              ' ' + error);
                $textarea.val('');
                window.location.hash = '';
            });
    }

    function save_text(text) {
        save_start();
        return $.ajax(SERVER_URL,
               {data: text, method: 'POST', contentType: 'text/plain'})
            .done(function(data) {
                save_end(true);
                window.location.hash = data;
                flash_message('success', 'Your text was saved as ' + data);
            })
            .fail(function(xhr, msg, error) {
                save_end(false);
                flash_message(
                    'danger', 'Error while attempting to save text: ' +
                        xhr.status + ' ' + error);
            });
    }

    function save_start() {
        $save_button
            .attr('disabled', true)
            .removeClass('btn-primary')
            .removeClass('btn-success')
            .removeClass('btn-danger')
            .addClass('btn-warning');
        $save_button.children('span').attr('class', 'fa fa-spinner fa-spin');
    }

    function save_end(success) {
        $save_button
            .attr('disabled', false)
            .removeClass('btn-warning');
        if (success) {
            $save_button.children('span').attr('class', 'fa fa-check');
            $save_button.addClass('btn-success');
        }
        else {
            $save_button.children('span').attr('class', 'fa fa-times');
            $save_button.addClass('btn-danger');
        }
        setTimeout(function() {
            $save_button.children('span').attr('class', 'fa fa-cloud');
            $save_button
                .removeClass('btn-success')
                .removeClass('btn-danger')
                .addClass('btn-primary');
        }, 1000);
    }

    window.onhashchange = function() {
        console.log('Hash: ' + window.location.hash);
        load_from_hash(window.location.hash);
    };
    load_from_hash(window.location.hash);

    $form.submit(function(evt) {
        evt.preventDefault();
        var text = $textarea.val();
        save_text(text);
    });

    $textarea.keydown(function(e) {
        if (e.ctrlKey && e.keyCode == 13) {
            // Ctrl-Enter pressed
            $form.submit();
        }
    });

});
