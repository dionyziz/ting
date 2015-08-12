var myUsername = null;
var URL = window.location.hostname + ':8080';
var socket = io.connect(URL);
var channel;
var ready = false;
var active = true;
var first = true;

function updateOwnMessagesInHistory() {
    $('#message-list li').each(function() {
        if ($(this).find('strong').text() == myUsername) {
            $(this).find('div').removeClass('other').addClass('self');
        }
    });
}

$(document).ready(function() {
    var title = document.title;
    var titlePrefix = '';
    var unread = 0;

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

    //socket.on('disconnect', function() {
    //    $('#messages').append('<li><strong><span class='text-warning'>The server is not available</span></strong></li>');
    //    $('#message').attr('disabled', 'disabled');
    //    $('#send').attr('disabled', 'disabled');
    //});
});

var Ting = React.createClass({
    render: function() {
    }
});
