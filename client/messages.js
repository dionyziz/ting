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
                // we must reverse the messages, as they are given to us in
                // reverse chronological order by the history API
                messages: messages.reverse()
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

var MessageForm = React.createClass({
    render: function() {
        return (
            <div class='textarea'>
                <form id='message'>
                    <input type='text' class='form-control' placeholder='Γράψε ένα μήνυμα...' />
                </form>
            </div>
        );
    }
});

React.render(
    <History />,
    document.getElementById('scroller')
);
React.render(
    <MessageForm />,
    document.getElementsByClassName('message-form-wrapper')[0]
);
