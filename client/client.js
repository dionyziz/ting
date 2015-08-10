var myUsername = null;
var URL = window.location.hostname + ':8080';
var socket = io.connect(URL);
var channel;
var wrapper = null;
var ready = false;
var active = true;
var ENTER = 13;
var first = true;

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
    var title = document.title;
    var titlePrefix = '';
    var unread = 0;

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

    $('#modal').modal('show');
    $('#username').focus();

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

    //socket.on('disconnect', function() {
    //    $('#messages').append('<li><strong><span class='text-warning'>The server is not available</span></strong></li>');
    //    $('#message').attr('disabled', 'disabled');
    //    $('#send').attr('disabled', 'disabled');
    //});
});
