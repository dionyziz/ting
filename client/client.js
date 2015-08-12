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
});

var Ting = React.createClass({
    render: function() {
        return (
            <div>
                <div className='top'>
                    <h1>Ting</h1>
                </div>
                <div className='app'>
                    <div className='nicklist'>
                        <UserList />
                    </div>
                    <div className='chat'>
                        <History />
                        <MessageForm />
                    </div>
                </div>
                <LoginForm />
            </div>
        );
    }
});

React.render(<Ting />, document.getElementsByClassName('ting')[0]);
