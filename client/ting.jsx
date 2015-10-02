const UserList = require('./userlist.jsx'),
      LoginForm = require('./login.jsx'),
      History = require('./message/history.jsx'),
      MessageForm = require('./message/form.jsx'),
      React = require('react'),
      Analytics = require('./analytics.js'),
      i18n = require('i18next-client'),
      io = require('socket.io-client'),
      config = require('./config.jsx'),
      _ = require('lodash');

const Ting = React.createClass({
    _socket: null,
    onLogin(username, people) {
        this.refs.history.onLogin(username, people);
        this.refs.messageForm.onLogin(username, people);
        this.refs.userList.onLogin(username, people);

        $.getJSON('/api/messages/' + this.state.channel, (messages) => {
            const history = _.indexBy(messages, 'id');

            this.refs.history.onHistoricalMessagesAvailable(history);
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
            intendedUsername: null,
            // TODO(dionyziz): race conditions and queues
            currentMessageId: null
        };
    },
    componentWillMount() {
        const URL = window.location.hostname + ':' + config.port;
        this._socket = io.connect(URL, {secure: config.websocket.secure});

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

        this._socket.on('start-typing-response', (messageid) => {
            this.setState({currentMessageId: messageid});
        });

        this._socket.on('update-typing-messages', (messagesTyping) => {
            this.refs.history.onUpdateTypingMessages(messagesTyping);
        });

        Analytics.init();
    },
    onMessageSubmit(message) {
        if (this.state.currentMessageId == null) {
            //console.log('Skipping message submit');
            return;
        }

        const data = {
            type: 'channel',
            target: this.state.channel,
            text: message,
            messageid: this.state.currentMessageId
        };
        this._socket.emit('message', data);

        Analytics.onMessageSubmit(message);

        this.setState({currentMessageId: null});
    },
    onStartTyping(message) {
        var data = {
            type: 'channel',
            target: this.state.channel,
            text: message
        };
        this._socket.emit('start-typing', data);
    },
    onTypingUpdate(message) {
        if (this.state.currentMessageId == null) {
            //console.log('Skipping typing-update');
            return;
        }

        var data = {
            type: 'channel',
            target: this.state.channel,
            text: message,
            messageid: this.state.currentMessageId
        };
        this._socket.emit('typing-update', data);
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
                                     onMessageSubmit={this.onMessageSubmit}
                                     onTypingUpdate={this.onTypingUpdate}
                                     onStartTyping={this.onStartTyping} />
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
