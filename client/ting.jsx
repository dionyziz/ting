const UserList = require('./userlist.jsx'),
      LoginForm = require('./login.jsx'),
      History = require('./message/history.jsx'),
      MessageForm = require('./message/form.jsx'),
      React = require('react'),
      ReactDOM = require('react-dom'),
      Analytics = require('./analytics.js'),
      _ = require('lodash'),
      $ = require('jquery'),
      TopBar = require('./topbar.jsx');

require('./css/index.css');

class Ting extends React.Component {
    constructor(props) {
        super(props);
        const url = location.href,
              parts = url.split('/');
        var [channel] = parts.slice(-1);

        if (channel == '' || channel == '?') {
            channel = 'ting';
        }

        this.state = {
            channel,
            currentMessageId: null
            // TODO(dionyziz): race conditions and queues
        };
    }

    onLogin = (username, people) => {
        this.refs.history.onLogin(username, people);
        this.refs.messageForm.onLogin(username, people);
        this.refs.userList.onLogin(username, people);
        this.refs.topBar.onLogin(username);
        this.props.onLoginIntention(username, people);

        // currently `type` is always 'channel'
        $.getJSON('/api/messages/channel/' + this.state.channel, (messages) => {
            const history = _.keyBy(messages, 'id');

            this.refs.history.onHistoricalMessagesAvailable(history);
        });
    };

    componentWillMount() {
        Analytics.init();
    }

    componentDidMount() {
        this.props.addListener('login-response', this.onLoginResponse);
        this.props.addListener('message', this.onMessage);
        this.props.addListener('part', this.onPart);
        this.props.addListener('join', this.onJoin);
        this.props.addListener('start-typing-response', this.onStartTypingResponse);
        this.props.addListener('update-typing-messages', this.onUpdateTypingMessages);

        if (this.props.username != null) {
            Analytics.onLoginIntention(this.props.username);

            this.onLogin(this.props.username, this.props.people);
        }
    }

    componentWillUnmount() {
        this.props.removeListener('login-response', this.onLoginResponse);
        this.props.removeListener('message', this.onMessage);
        this.props.removeListener('part', this.onPart);
        this.props.removeListener('join', this.onJoin);
        this.props.removeListener('start-typing-response', this.onStartTypingResponse);
        this.props.removeListener('update-typing-messages', this.onUpdateTypingMessages);
    }

    onLoginResponse = ({success, people, error}) => {
        if (!success) {
            this.refs.loginForm.onError(error);
        }
        else {
            this.refs.loginForm.onSuccess();

            var peopleList = _.chain(people)
                .value();

            this.onLogin(this.props.username, peopleList);
        }
    };

    onMessage = (data) => {
        this.refs.history.onMessage(data);
    };

    onPart = (username) => {
        this.refs.userList.onPart(username);
        this.refs.history.deleteTypingMessage(username);
    };

    onJoin = (username) => {
        this.refs.userList.onJoin(username);
    };

    onStartTypingResponse = (messageid) => {
        this.setState({currentMessageId: messageid});
        this.refs.messageForm.onStartTypingResponse(messageid);
    };

    onUpdateTypingMessages = (messagesTyping) => {
        this.refs.history.onUpdateTypingMessages(messagesTyping);
    };

    onMessageSubmit = (message, messageType) => {
        if (this.state.currentMessageId == null) {
            //console.log('Don\'t have a message id yet.');
            return false;
        }

        const data = {
            type: 'channel',
            target: this.state.channel,
            message_content: message,
            messageid: this.state.currentMessageId,
            message_type: messageType
        };
        this.props.socket.emit('message', data);

        Analytics.onMessageSubmit(message);

        this.setState({currentMessageId: null});
        return true;
    };

    onStartTyping = (message, messageType) => {
        var data = {
            type: 'channel',
            target: this.state.channel,
            message_content: message,
            message_type: messageType
        };
        this.props.socket.emit('start-typing', data);
    };

    onTypingUpdate = (message) => {
        if (this.state.currentMessageId == null) {
            //console.log('Skipping typing-update');
            return;
        }

        var data = {
            message_content: message,
            messageid: this.state.currentMessageId
        };
        this.props.socket.emit('typing-update', data);
    };

    onLoginIntention = (intendedUsername) => {
        this.props.updateUsername(intendedUsername);

        Analytics.onLoginIntention(intendedUsername);
        this.props.socket.emit('login', intendedUsername);
    };

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
                           username={this.props.username}
                           onLoginIntention={this.onLoginIntention} />
            </div>
        );
    }
}

module.exports = Ting;
