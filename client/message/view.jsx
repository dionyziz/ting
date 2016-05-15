const React = require('react/addons'),
      Avatar = require('../avatar.jsx'),
      MessageContent = require('./content.jsx');

const Message = React.createClass({
    render() {
        var className, message_content = this.props.message_content;

        if (this.props.own) {
            className = 'self';
        }
        else {
            className = 'other';
        }

        if (this.props.typing) {
            className += ' typing';
        }

        if (this.props.own && this.props.typing) {
            message_content = '...';
        }

        return (
            <li className={className}>
                <Avatar username={this.props.username} />
                <strong>{this.props.username}</strong>
                <MessageContent messageType={this.props.messageType}
                                message_content={message_content} />
            </li>
        );
    }
});

module.exports = Message;
