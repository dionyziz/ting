var History = React.createClass({
    getInitialState: function() {
        return {
            messages: []
        };
    },
    componentDidMount: function() {
        var self = this;

        $.getJSON('/api/messages/' + channel, function(messages) {
            self.setState({
                messages: messages
            });
        });

        socket.on('message', function(data) {
            if (ready && data.target == channel) {
                var newState = React.addons.update(
                    self.state, {
                        messages: {
                            $push: [data]
                        }
                    }
                );
                self.setState(newState);

                if (!active) {
                    ++unread;
                    updateTitle();
                }

                scrollDown();
            }
        });
    },
    render: function() {
        var messages = this.state.messages.reverse();
        var messageNodes = this.state.messages.map(function (message) {
            return (
                <Message username={message.username}
                         text={message.text} />
            );
        });
        return (
            <ul id='message-list'>
                {messageNodes}
            </ul>
        )
    },
    componentDidUpdate: function() {
        scrollDown();
    }
});

var Message = React.createClass({
    render: function() {
        var className;

        if (this.props.username == myUsername) {
            className = 'self';
        }
        else {
            className = 'other';
        }

        return (
            <li>
                <Avatar username={this.props.username} />
                <strong>{this.props.username}</strong>

                <div className={className}>
                    {formatMessage(this.props.text)}
                </div>
            </li>
        )
    }
});

var Avatar = React.createClass({
    render: function() {
        var src = getAvatar(this.props.username);

        return (
            <img src={src} alt={this.props.username} className="avatar" />
        );
    }
});

React.render(<History />, document.getElementById('scroller'));
