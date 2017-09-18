const React = require('react');

class Image extends React.Component {
    render() {
        var message_content = this.props.message_content;

        return (
            <img src={message_content} alt='image' />
        );
    }
}

module.exports = Image;
