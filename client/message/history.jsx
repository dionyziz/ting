const React = require('react'),
      ReactDOM = require('react-dom'),
      emoticons = require('emoticons'),
      Message = require('./view.jsx'),
      _ = require('lodash'),
      $ = require('jquery'),
      update = require('immutability-helper');

const History = React.createClass({
    _wrapper: null,
    _title: document.title,
    _audio: new Audio('static/sounds/message_sound.mp3'),
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
        this.setState((prevState) => {
            let messages = prevState.messages;

            for (var id of Object.keys(messages)) {
                if (messages[id].username == username && messages[id].typing) {
                    messages = update(messages, {$unset: [id]});
                }
            }

            return {messages};
        });
    },
    onUpdateTypingMessages(messagesTyping) {
        this.setState((prevState) => {
            let messages = prevState.messages;

            $.each(messagesTyping, (messageid, message) => {
                if (message.message_content.trim().length == 0) {
                    messages = update(messages, {$unset: [messageid]});
                }
                else if (message.target == this.props.channel) {
                    if (messages[messageid]) {
                        messages = update(messages, {
                            [messageid]: {$merge: {
                                message_content: message.message_content
                            }}
                        });
                    }
                    else {
                        messages = update(messages, {
                            [messageid]: {$set: {
                                message_content: message.message_content,
                                username: message.username,
                                target: message.target,
                                id: messageid,
                                typing: true,
                                message_type: message.message_type
                            }}
                        });
                    }
                }
            });

            return {messages};
        });
    },
    onHistoricalMessagesAvailable(messages) {
        this.setState({messages});
    },
    onLogin(myUsername) {
        this.setState({myUsername});
    },
    onMessage(data) {
        if (data.target == this.props.channel) {
            this.setState((prevState, currentProps) => {
                let messages = prevState.messages;

                messages = update(messages, {
                    [data.messageid]: {$merge: {
                        message_content: data.message_content,
                        typing: false
                    }}
                });

                let unread = prevState.unread;
                if (!prevState.active && data.username != prevState.myUsername) {
                    unread = prevState.unread + 1;
                    this._audio.play();
                }
                return {
                    messages,
                    unread
                };
            });
        }
    },
    componentDidMount() {
        this._wrapper = ReactDOM.findDOMNode(this.refs.wrapper);

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
