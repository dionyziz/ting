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
    onLogin(myUsername) {
        this.state.myUsername = myUsername;

        $.getJSON('/api/messages/' + channel, (messages) => {
            this.setState({
                // we must reverse the messages, as they are given to us in
                // reverse chronological order by the history API
                messages: messages.reverse()
            });
        });

        socket.on('message', (data) => {
            if (ready && data.target == channel) {
                var newState = React.addons.update(
                    this.state, {
                        messages: {
                            $push: [data]
                        }
                    }
                );
                this.setState(newState);

                if (!this.state._active && data.username != myUsername) {
                    this.setState({
                        unread: this.state.unread + 1
                    });
                }
            }
        });
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
        var messageNodes = this.state.messages.map((message) => {
            return (
                <Message username={message.username}
                         own={message.username == this.state.myUsername}
                         text={message.text} />
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
        var div = document.createElement('div');
        var text = document.createTextNode(input);
        div.appendChild(text);
        return div.innerHTML;
    },
    _formatMessage(message) {
        var html = this._escapeHTML(message);

        return {
            __html: html.autoLink({
                target: "_blank", rel: "nofollow"
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
    first: true,
    getInitialState() {
        return {
            message: ''
        };
    },
    handleSubmit(event) {
        event.preventDefault();

        var message = this.state.message;

        if (message.trim().length > 0) {
            if (this.first) {
                ga('send', 'event', {
                    eventCategory: 'chat',
                    eventAction: 'chat_form_submit',
                    eventLabel: 'send',
                    eventValue: 1
                });
                this.first = false;
            }

            data = { type: 'channel', target: channel, text: message };
            socket.emit('message', data);

            React.findDOMNode(this.refs.inputField).value = '';
        }
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
                           placeholder='Γράψε ένα μήνυμα...'
                           value={this.state.message}
                           onChange={this.handleChange}
                           ref='inputField' />
                </form>
            </div>
        );
    }
});
