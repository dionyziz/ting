var UserList = require('./userlist.jsx');
var LoginForm = require('./login.jsx');
var messages = require('./messages.jsx');
var History = messages.History;
var MessageForm = messages.MessageForm;
var React = require('react');
var Analytics = require('./analytics.js');
var i18n = require('i18next-client');
var io = require('socket.io-client');
var _ = require('lodash');

var Ting = React.createClass({
    _socket: null,
    _uid: 0,
    _getUniqueMessageId() {
        ++this._uid;
        return this._uid;
    },
    onLogin(username, people) {
        this.refs.history.onLogin(username, people);
        this.refs.messageForm.onLogin(username, people);
        this.refs.userList.onLogin(username, people);

        $.getJSON('/api/messages/' + this.state.channel, (messages) => {
            // we must reverse the messages, as they are given to us in
            // reverse chronological order by the history API
            messages = messages.map((message) => {
                // TODO(vitsalis): grab this message id from the server
                message.id = this._getUniqueMessageId();
                return message;
            });
            this.refs.history.onHistoricalMessagesAvailable(messages.reverse());
        });
    },
    getInitialState() {
        const url = location.href,
              parts = url.split('/');
        var [channel] = parts.slice(-1);

        if (channel == '' || channel == '?') {
            channel = 'ting';
        }

        return {
            channel,
            intendedUsername: null
        };
    },
    componentWillMount() {
        const URL = window.location.hostname + ':8080';
        this._socket = io.connect(URL);

        this._socket.on('login-response', ({success, people, error}) => {
            if (!success) {
                this.refs.loginForm.onError(error);
            }
            else {
                this.refs.loginForm.onSuccess();

                var peopleList = _.chain(people)
                    .values()
                    .without(this.intendedUsername)
                    .value();

                this.onLogin(this.state.intendedUsername, peopleList);
            }
        });

        this._socket.on('message', (data) => {
            data.id = this._getUniqueMessageId();
            this.refs.history.onMessage(data);
        });

        this._socket.on(
            'part',
            (username) => this.refs.userList.onPart(username)
        );

        this._socket.on(
            'join',
            (username) => this.refs.userList.onJoin(username)
        );

        Analytics.init();
    },
    onMessageSubmit(message) {
        const data = {
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
    () => {
        React.render(<Ting />, document.getElementsByClassName('ting')[0]);
    }   
);
