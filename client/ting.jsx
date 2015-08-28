var UserList = require('./userlist.jsx');
var LoginForm = require('./login.jsx');
var messages = require('./messages.jsx');
var History = messages.History;
var MessageForm = messages.MessageForm;
var React = require('react');
var Analytics = require('./analytics.jsx');

var Ting = React.createClass({
    _socket: null,
    onLogin(username, people) {
        this.refs.history.onLogin(username, people);
        this.refs.messageForm.onLogin(username, people);
        this.refs.userList.onLogin(username, people);

        $.getJSON('/api/messages/' + this.state.channel, (messages) => {
            // we must reverse the messages, as they are given to us in
            // reverse chronological order by the history API
            this.refs.history.onHistoricalMessagesAvailable(messages.reverse())
        });
    },
    getInitialState() {
        var url = location.href;
        var parts = url.split('/');
        var channel = parts.slice(-1)[0]

        if (channel == '' || channel == '?') {
            channel = 'ting';
        }

        return {
            channel,
            intendedUsername: null
        };
    },
    componentWillMount() {
        var URL = window.location.hostname + ':8080';
        this._socket = io.connect(URL);

        this._socket.on('login-response', (response) => {
            var success = response.success;
            var people = response.people;

            if (!success) {
                this.refs.loginForm.onError(response.error);
            }
            else {
                this.refs.loginForm.onSuccess();

                var peopleList = [];
                $.each(people, (clientid, username) => {
                    if (this.intendedUsername != username) {
                        peopleList.push(username);
                    }
                });

                this.onLogin(this.state.intendedUsername, peopleList);
            }
        });

        this._socket.on('message', (data) => {
            this.refs.history.onMessage(data);
        });

        this._socket.on('part', (username) => {
            this.refs.userList.onPart(username)
        });
        this._socket.on('join', (username) => {
            this.refs.userList.onJoin(username)
        });

        Analytics.init();
    },
    onMessageSubmit(message) {
        data = {
            type: 'channel',
            target: this.state.channel,
            text: message
        };
        this._socket.emit('message', data);

        Analytics.onMessageSubmit(message);
    },
    onLoginIntention(intendedUsername) {
        this.setState({intendedUsername});

        Analytics.onLoginIntention(intendedUsername);
        this._socket.emit('login', intendedUsername);
    },
    render() {
        return (
            <div>
                <div className='top'>
                    <h1>Ting</h1>
                </div>
                <div className='app'>
                    <div className='nicklist'>
                        <UserList ref='userList' />
                    </div>
                    <div className='chat'>
                        <History ref='history'
                                 channel={this.state.channel} />
                        <MessageForm ref='messageForm'
                                     channel={this.state.channel}
                                     onMessageSubmit={this.onMessageSubmit} />
                    </div>
                </div>
                <LoginForm ref='loginForm'
                           onLoginIntention={this.onLoginIntention} />
            </div>
        );
    }
});

i18n.init(
    { 
        resGetPath:' locales/__lng__.json',
        lng: 'el-GR'
    },
    (t) => {
        React.render(<Ting />, document.getElementsByClassName('ting')[0]);
    }   
);
