$(document).ready(function() {
    URL = 'www.ting.gr:8080';
    var ENTER = 13;
    var ready = false;
    var rex = /^[α-ωa-z0-9]+$/i;
    var wrapper = $('.history-wrapper');
    var myUsername = null;
    var socket = io.connect(URL);
    var first = true;

    function scrollDown() {
        setTimeout(function() {
            wrapper.scrollTop(wrapper.get(0).scrollHeight);
        }, 30);
    }

    function username_error_show(error) {
        $('#username-alert').empty();
        var $par = $('<p></p>');
        var errors = {
            empty: 'Γράψε ένα ψευδώνυμο.',
            length: 'Το ψευδώνυμο πρέπει να είναι έως 20 γράμματα.',
            chars: 'Το ψευδώνυμο πρέπει να περιλαμβάνει μόνο γραμματα, αριθμούς ή σύμβολα.',
            taken: 'Το ψευδώνυμο το έχει άλλος.'
        };

        $par.append(errors[error]);

        $('#username-alert').append($par);
        $('#username-alert').show();
    }

    function username_error_validation(username) {
        if (username == '') {
            return 'empty';
        }
        else if (username.length > 20) {
            return 'length';
        }
        else if (!rex.test(username)) {
            return 'chars';
        } 
        return true;
    }

    $('#username-set-modal').modal('show');
    $('#username-alert').hide()
    setTimeout(function() {
        $('#username').focus();
    }, 300);

    var url = $(location).attr('href');
    parts = url.split('/');
    var channel = parts[1];

    if (channel == '') {
        channel = 'ting';
    }

    function getAvatar(name) {
        return 'https://avatars.githubusercontent.com/' + name.toLowerCase();
    }

    $.getJSON('/api/messages/' + channel, function(msgs) {
        $.each(msgs, function(index, msg) {
            var src = getAvatar(msg.username);
            var $img = $('<img src="' + src + '" alt="' + msg.username + '" class="avatar" />');
            var $li = $('<li></li>');

            $li.append($img);
            $li.append(document.createTextNode(' '));
            $li.append($('<strong>' + msg.username + '</strong>'));
            $li[0].innerHTML += ' <div class="other">' + msg.text + '</div>';

            $('#msg-list').prepend($li);
        });
        scrollDown();
    });

    $('#modal').modal('show');
    $('#username').focus();
        
    $('#username-set').submit(function(event) {
        event.preventDefault();
        ga('send', 'event', { 
            eventCategory: 'join', eventAction: 'username_set', eventLabel: 'submit', eventValue: 1
        });

        var username = $('#username').val();
        var response = username_error_validation(username);

        if (response != true) {
            username_error_show(response);
            return;
        }
        socket.emit('join', username);
    });

    $('#msg input').keypress(function(e) {
        if (e.which == ENTER) {
            e.preventDefault();

            var msg = $('#msg input').val();
            if (msg != '') {
                if (first) {
                    ga('send', 'event', { 
                        eventCategory: 'chat', eventAction: 'chat_form_submit', eventLabel: 'send', eventValue: 1
                    });
                    first = false;
                }

                data = { ch: channel, msg: msg };
                socket.emit('send', data);
                $('#msg input').val('');
                scrollDown();
            }
        }
    });

    socket.on('join-response', function(success) {
        if (!success) {
            username_error_show('taken');
            return;
        }
        ready = true;
        $('#username-set-modal').modal('hide');
        $('#msg input').focus();
    });

    socket.on('update', function(msg) {
        if (ready) {
            $('#msg-list').append('<li>' + msg + '</li>');
            scrollDown();
        }
    });

    socket.on('update-people', function(people) {
        if (ready) {
            $('#online-list').empty();
            $.each(people, function(clientid, name) {
                $('#online-list').append('<li>' + name + '</li>');
            });
        }
    });

    socket.on('chat', function(who, msg) {
        if (ready) {
            var avatarHTML = '<img src="' + getAvatar(who) + '" alt="' + who + '" class="avatar"/>';
            var className;

            if (who == myUsername) {
                className = 'self';
            }
            else {
                className = 'other';
            }

            var html = '<li>' + avatarHTML + ' <strong>' + who + '</strong> <div class="' + className + '">' + msg + '</div></li>';

            $('#msg-list').append(html);
            scrollDown();
        }
    });

    //socket.on('disconnect', function() {
    //    $('#msgs').append('<li><strong><span class='text-warning'>The server is not available</span></strong></li>');
    //    $('#msg').attr('disabled', 'disabled');
    //    $('#send').attr('disabled', 'disabled');
    //});
});
