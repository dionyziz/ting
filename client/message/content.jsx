const React = require('react/addons'),
      Text = require('./text.jsx'),
      Image = require('./image.jsx');

const MessageContent = React.createClass({
    render() {
        var text = this.props.text;
        var messageType = this.props.messageType;
        var message_class = null;

        switch (messageType) {
            case 'text':
                message_class = <Text message_content={message_content} />;
            break;

            case 'image':
                message_class = <Image message_content={message_content} />;
            break;
        }

        return message_class;
    }
});

module.exports = MessageContent;
