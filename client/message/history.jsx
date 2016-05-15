const React = require('react/addons'),
      emoticons = require('emoticons'),
      Message = require('./view.jsx'),
      _ = require('lodash');

const History = React.createClass({
    _wrapper: null,
    _title: document.title,
    _scrollDown() {
        setTimeout(() => {
            this._wrapper.scrollTop = this._wrapper.scrollHeight;
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
            messages: {},
            unread: 0,
            active: true,
            myUsername: null
        };
    },
    deleteTypingMessage(username) {
        var messages = this.state.messages;

        for (var id in messages) {
            if (messages[id].username == username && messages[id].typing) {
                delete messages[id];
            }
        }

        this.setState({messages});
    },
    onUpdateTypingMessages(messagesTyping) {
        var messages = this.state.messages;

        $.each(messagesTyping, (messageid, message) => {
            if (message.message_content.trim().length == 0) {
                delete messages[messageid];
            }
            else if (message.target == this.props.channel) {
                if (messages[messageid]) {
                    messages[messageid].message_content = message.message_content;
                }
                else {
                    messages[messageid] = {
                        message_content: message.message_content,
                        username: message.username,
                        target: message.target,
                        id: messageid,
                        typing: true,
                        message_type: message.message_type
                    };
                }
            }
        });

        this.setState({messages});
    },
    onHistoricalMessagesAvailable(messages) {
        this.setState({messages});
    },
    onLogin(myUsername) {
        this.setState({myUsername});
    },
    onMessage(data) {
        if (data.target == this.props.channel) {
            this.setState((previousState, currentProps) => {
                var messages = previousState.messages;
                messages[data.messageid].message_content = data.message_content;
                messages[data.messageid].typing = false;

                return {messages};
            });

            if (!this.state.active && data.username != this.state.myUsername) {
                this.setState({
                    unread: this.state.unread + 1
                });
            }
        }
    },
    componentDidMount() {
        this._wrapper = React.findDOMNode(this.refs.wrapper);

        $.getJSON('node_modules/emoticons/support/skype/emoticons.json', function(definition) {
            emoticons.define(definition);
        });

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
        const messageNodes = _.chain(this.state.messages)
            .values()
            .sortBy('id')
            .map(({id, username, message_content, typing, message_type}) => {
                return (
                    <Message key={id}
                             username={username}
                             own={username == this.state.myUsername}
                             message_content={message_content}
                             typing={typing}
                             messageType={message_type} />
                );
            })
            .value();

        return (
            <div className='history'>
                <div className='history-wrapper' id='scroller' ref='wrapper'>
                    <ul id='message-list'>
                        {messageNodes}
                    </ul>
                </div>
            </div>
        );
    },
    componentDidUpdate() {
        this._updateTitle();
        this._scrollDown();
    }
});

module.exports = History;
