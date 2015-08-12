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

var Ting = React.createClass({
    render() {
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
