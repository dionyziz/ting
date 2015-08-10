var myUsername = null;
var URL = window.location.hostname + ':8080';
var socket = io.connect(URL);
var channel;
var wrapper = $('.history-wrapper');

function formatMessage(message) {
    var html = escapeHTML(message);

    return html.autoLink({
        target: "_blank", rel: "nofollow"
    });
}

function escapeHTML(input) {
    var div = document.createElement('div');
    var text = document.createTextNode(input);
    div.appendChild(text);
    return div.innerHTML;
}

function scrollDown() {
    setTimeout(function() {
        wrapper.scrollTop(wrapper.get(0).scrollHeight);
    }, 30);
}

function getAvatar(username) {
    return 'https://avatars.githubusercontent.com/' + escapeHTML(username.toLowerCase());
}

function addOnlineUserToList(username) {
    var $avatar = $('<img />');
    $avatar[0].src = getAvatar(username);
    $avatar.addClass('avatar');

    var $name = $('<span>' + escapeHTML(username) + '</span>');

    var $li = $('<li />');

    $li.append($avatar);
    $li.append(document.createTextNode(' '));
    $li.append($name);

    $('#online-list').append($li);
}

$(document).ready(function() {
    var ENTER = 13;
    var ready = false;
    var first = true;
    var title = document.title;
    var titlePrefix = '';
    var unread = 0;
    var active = true;

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

    var url = $(location).attr('href');
    parts = url.split('/');
    channel = parts.slice(-1)[0]

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

    socket.on('login-response', function(resp) {
        if (!resp.success) {
            // TODO: Migrate this to Login Form
            // usernameErrorShow(resp.error);
            usernameErrorShow(resp.error);
            return;
        }
        $.each(resp.people, function(clientid, username) {
            addOnlineUserToList(username);
        });
        ready = true;
        $('#username-set-modal').modal('hide');
        $('#message input').focus();

        updateOwnMessagesInHistory();
    });

    socket.on('join', function(username) {
        if (username != myUsername) {
            addOnlineUserToList(username);
        }
    });

    socket.on('part', function(username) {
        $('#online-list li span').filter(function() {
            return $(this).text() == username; 
        }).parent().remove();
    });

    socket.on('message', function(data) {
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
