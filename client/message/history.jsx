const React = require('react/addons'),
      emoticons = require('emoticons'),
      Message = require('./view.jsx');

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
