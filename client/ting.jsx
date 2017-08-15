const UserList = require('./userlist.jsx'),
      LoginForm = require('./login.jsx'),
      History = require('./message/history.jsx'),
      MessageForm = require('./message/form.jsx'),
      React = require('react'),
      ReactDOM = require('react-dom'),
      Analytics = require('./analytics.js'),
      io = require('socket.io-client'),
      config = require('./config.jsx'),
      _ = require('lodash'),
      TopBar = require('./topbar.jsx');

const Ting = React.createClass({
    _socket: null,
    onLogin(username, people) {
        this.refs.history.onLogin(username, people);
        this.refs.messageForm.onLogin(username, people);
        this.refs.userList.onLogin(username, people);
        this.refs.topBar.onLogin(username);

        // currently `type` is always 'channel'
        $.getJSON('/api/messages/channel/' + this.state.channel, (messages) => {
            const history = _.keyBy(messages, 'id');

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
                    .without(this.intendedUsername)
                    .value();

                this.onLogin(this.state.intendedUsername, peopleList);
            }
        });

        this._socket.on('message', (data) => {
            this.refs.history.onMessage(data);
        });

        this._socket.on('part', (username) => {
            this.refs.userList.onPart(username);
            this.refs.history.deleteTypingMessage(username);
        });

        this._socket.on(
            'join',
            (username) => this.refs.userList.onJoin(username)
        );

        this._socket.on('start-typing-response', (messageid) => {
            this.setState({currentMessageId: messageid});
            this.refs.messageForm.onStartTypingResponse(messageid);
        });

        this._socket.on('update-typing-messages', (messagesTyping) => {
            this.refs.history.onUpdateTypingMessages(messagesTyping);
        });

        Analytics.init();
    },
    onMessageSubmit(message, messageType) {
        if (this.state.currentMessageId == null) {
            //console.log('Skipping message submit');
            return;
        }

        const data = {
            type: 'channel',
            target: this.state.channel,
            message_content: message,
            messageid: this.state.currentMessageId,
            message_type: messageType
        };
        this._socket.emit('message', data);

        Analytics.onMessageSubmit(message);

        this.setState({currentMessageId: null});
    },
    onStartTyping(message, messageType) {
        var data = {
            type: 'channel',
            target: this.state.channel,
            message_content: message,
            message_type: messageType
        };
        this._socket.emit('start-typing', data);
    },
    onTypingUpdate(message) {
        if (this.state.currentMessageId == null) {
            //console.log('Skipping typing-update');
            return;
        }

        var data = {
            message_content: message,
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
                    <TopBar ref='topBar' />
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
        ReactDOM.render((
            <BrowserRouter>
                <Switch>
                    <Route path='/' component={Ting} />
                </Switch>
            </BrowserRouter>), document.getElementsByClassName('ting')[0]);
    }   
);
