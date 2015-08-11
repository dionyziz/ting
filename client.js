$(document).ready(function() {
    URL = window.location.hostname + ':8080';
    var ENTER = 13;
    var ready = false;
    var rex = /^[α-ωa-z0-9]+$/i;
    var wrapper = $('.history-wrapper');
    var myUsername = null;
    var socket = io.connect(URL);
    var first = true;
    var title = document.title;
    var titlePrefix = '';
    var unread = 0;
    var active = true;

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

    function getAvatar(username) {
        return 'https://avatars.githubusercontent.com/' + escapeHTML(username.toLowerCase());
    }

    function updateOwnMessagesInHistory() {
        $('#message-list li').each(function() {
            if ($(this).find('strong').text() == myUsername) {
                $(this).find('div').removeClass('other').addClass('self');
            }
        });
    }

    function updateTitle() {
        if (active) {
            titlePrefix = '';
        }
        else {
            titlePrefix = '(' + unread + ') ';
        }

        document.title = titlePrefix + title;
    }

    function escapeHTML(input) {
        var div = document.createElement('div');
        var text = document.createTextNode(input);
        div.appendChild(text);
        return div.innerHTML;
    }

    function formatMessage(message) {
        var html = escapeHTML(message);

        return html.autoLink({
            target: "_blank", rel: "nofollow"
        });
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

    $.getJSON('/api/messages/' + channel, function(messages) {
        $.each(messages, function(index, message) {
            var src = getAvatar(message.username);
            var $img = $('<img src="' + src + '" alt="' + escapeHTML(message.username) + '" class="avatar" />');
            var $li = $('<li></li>');

            $li.append($img);
            $li.append(document.createTextNode(' '));
            $li.append($('<strong>' + escapeHTML(message.username) + '</strong>'));
            $li[0].innerHTML += ' <div class="other">' + formatMessage(message.text) + '</div>';

            $('#message-list').prepend($li);
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

    $('#message input').keypress(function(e) {
        if (e.which == ENTER) {
            e.preventDefault();

            var message = $('#message input').val();
            if (message.trim().length > 0) {
                if (first) {
                    ga('send', 'event', { 
                        eventCategory: 'chat', eventAction: 'chat_form_submit', eventLabel: 'send', eventValue: 1
                    });
                    first = false;
                }

                data = { type: 'channel', target: channel, text: message };
                socket.emit('message', data);
                $('#message input').val('');
                scrollDown();
            }
        }
    });

    $(document).on({
        'show': function() {
            active = true;
            unread = 0;
            updateTitle();
        },
        'hide': function() {
            active = false;
        }
    });

    socket.on('join-response', function(success) {
        if (!success) {
            usernameErrorShow('taken');
            return;
        }
        ready = true;
        $('#username-set-modal').modal('hide');
        $('#message input').focus();

        updateOwnMessagesInHistory();
    });

    socket.on('update', function(message) {
        if (ready) {
            $('#message-list').append('<li>' + message + '</li>');
            scrollDown();
        }
    });

    socket.on('update-people', function(people) {
        if (ready) {
            $('#online-list').empty();
            $('#online-list').append(
                $('<li class="active"><span>' + escapeHTML(channel) + '</span></li>')
            );

            $.each(people, function(clientid, name) {
                var $avatar = $('<img />');
                $avatar[0].src = getAvatar(name);
                $avatar.addClass('avatar');

                var $name = $('<span>' + escapeHTML(name) + '</span>');

                var $li = $('<li />');

                $li.append($avatar);
                $li.append(document.createTextNode(' '));
                $li.append($name);

                $('#online-list').append($li);
            });
        }
    });

    socket.on('chat', function(data) {
        if (ready && data.target == channel) {
            var avatarHTML = '<img src="' + getAvatar(data.username) + '" alt="' + escapeHTML(data.username) + '" class="avatar"/>';
            var className;

            if (data.username == myUsername) {
                className = 'self';
            }
            else {
                className = 'other';
            }

            var html = '<li>' + avatarHTML + ' <strong>' + escapeHTML(data.username) + '</strong> <div class="' + className + '">' + formatMessage(data.text) + '</div></li>';

            if (!active) {
                ++unread;
                updateTitle();
            }

            $('#message-list').append(html);
            scrollDown();
        }
    });

    //socket.on('disconnect', function() {
    //    $('#messages').append('<li><strong><span class='text-warning'>The server is not available</span></strong></li>');
    //    $('#message').attr('disabled', 'disabled');
    //    $('#send').attr('disabled', 'disabled');
    //});
});
