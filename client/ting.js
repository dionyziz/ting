var myUsername = null;
var URL = window.location.hostname + ':8080';
var socket = io.connect(URL);
var channel;
var ready = false;
var active = true;

var Ting = React.createClass({
    onLogin(username) {
        myUsername = username;
        this.refs.history.onLogin(username);
    },
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
                        <History ref='history' />
                        <MessageForm />
                    </div>
                </div>
                <LoginForm onLogin={this.onLogin} />
            </div>
        );
    }
});

React.render(<Ting />, document.getElementsByClassName('ting')[0]);
