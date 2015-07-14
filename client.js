$(document).ready(function() {
    URL = window.location.hostname + ':8080';
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

    function usernameErrorShow(error) {
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

    function usernameErrorValidation(username) {
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
    var channel = parts.slice(-1)[0]

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
            $li[0].innerHTML += ' <div class="other">' + formatMessage(msg.text) + '</div>';

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

        myUsername = $('#username').val();
        var response = usernameErrorValidation(myUsername);

        if (response != true) {
            usernameErrorShow(response);
            return;
        }
        socket.emit('join', myUsername);
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

    function formatMessage(message) {
        var div = document.createElement('div');
        var text = document.createTextNode(message);
        div.appendChild(text);
        var html = div.innerHTML;

        html = html.replace(/(https?\:\/\/[a-zA-Z/0-9?&_.-]*)/g,
                            "<a href='$1' rel='nofollow'>$1</a>");

        return html;
    }

    function updateOwnMessagesInHistory() {
        $('#msg-list li').each(function() {
            if ($(this).find('strong').text() == myUsername) {
                $(this).find('div').removeClass('other').addClass('self');
            }
        });
    }

    socket.on('join-response', function(success) {
        if (!success) {
            usernameErrorShow('taken');
            return;
        }
        ready = true;
        $('#username-set-modal').modal('hide');
        $('#msg input').focus();

        updateOwnMessagesInHistory();
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

    socket.on('chat', function(data) {
        if (ready && data.ch == channel) {
            var avatarHTML = '<img src="' + getAvatar(data.who) + '" alt="' + data.who + '" class="avatar"/>';
            var className;

            if (data.who == myUsername) {
                className = 'self';
            }
            else {
                className = 'other';
            }

            var html = '<li>' + avatarHTML + ' <strong>' + data.who + '</strong> <div class="' + className + '">' + formatMessage(data.msg) + '</div></li>';

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
