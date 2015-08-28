var React = require('react/addons');
var Avatar = require('./avatar.jsx');
var i18n = require('i18next-client');

var History = React.createClass({
    _wrapper: null,
    _title: document.title,
    _scrollDown() {
        setTimeout(() => {
            this._wrapper.scrollTop(this._wrapper.get(0).scrollHeight);
        }, 30);
    },
    _updateTitle() {
        var titlePrefix;

        if (this.state.active || this.state.unread == 0) {
            titlePrefix = '';
        }
        else {
            titlePrefix = '(' + this.state.unread + ') ';
        }

        document.title = titlePrefix + this._title;
    },
    getInitialState() {
        return {
            messages: [],
            unread: 0,
            active: true,
            myUsername: null
        };
    },
    onHistoricalMessagesAvailable(messages) {
        this.setState({messages});
    },
    onLogin(myUsername) {
        this.setState({myUsername});
    },
    onMessage(data) {
        if (data.target == this.props.channel) {
            var newState = React.addons.update(
                this.state, {
                    messages: {
                        $push: [data]
                    }
                }
            );
            this.setState(newState);

            if (!this.state.active && data.username != this.state.myUsername) {
                this.setState({
                    unread: this.state.unread + 1
                });
            }
        }
    },
    componentDidMount() {
        this._wrapper = $('.history-wrapper');

        $(document).on({
            show: () => {
                this.setState({
                    active: true,
                    unread: 0
                });
            },
            hide: () => {
                this.setState({
                    active: false
                });
            }
        });
    },
    render() {
        var messageNodes = this.state.messages.map(({id, username, text}) => {
            return (
                <Message key={id}
                         username={username}
                         own={username == this.state.myUsername}
                         text={text} />
            );
        });
        return (
            <div className='history'>
                <div className='history-wrapper' id='scroller'>
                    <ul id='message-list'>
                        {messageNodes}
                    </ul>
                </div>
            </div>
        )
    },
    componentDidUpdate() {
        this._updateTitle();
        this._scrollDown();
    }
});

var Message = React.createClass({
    _escapeHTML(input) {
        const div = document.createElement('div'),
              text = document.createTextNode(input);
        div.appendChild(text);
        return div.innerHTML;
    },
    _formatMessage(message) {
        var html = this._escapeHTML(message);

        return {
            __html: html.autoLink({
                target: '_blank', rel: 'nofollow'
            })
        };
    },
    render() {
        var className;

        if (this.props.own) {
            className = 'self';
        }
        else {
            className = 'other';
        }

        return (
            <li>
                <Avatar username={this.props.username} />
                <strong>{this.props.username}</strong>

                <div className={className}
                     dangerouslySetInnerHTML={this._formatMessage(this.props.text)}>
                </div>
            </li>
        )
    }
});

var MessageForm = React.createClass({
    getInitialState() {
        return {
            message: ''
        };
    },
    handleSubmit(event) {
        event.preventDefault();

        var message = this.state.message;

        if (message.trim().length > 0) {
            this.props.onMessageSubmit(message);

            React.findDOMNode(this.refs.inputField).value = '';
        }

        this.setState({
            message: ''
        });
    },
    onLogin(username) {
        React.findDOMNode(this.refs.inputField).focus();
    },
    handleChange(event) {
        this.setState({
            message: event.target.value
        });
    },
    render() {
        return (
            <div className='textarea'>
                <form id='message'
                      onSubmit={this.handleSubmit}>
                    <input type='text'
                           className='form-control'
                           placeholder={i18n.t('messageInput.placeholder')}
                           value={this.state.message}
                           onChange={this.handleChange}
                           ref='inputField' />
                </form>
            </div>
        );
    }
});

module.exports = {History, MessageForm};
