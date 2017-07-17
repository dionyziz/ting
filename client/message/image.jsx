const React = require('react');

const Image = React.createClass({
    render() {
        var message_content = this.props.message_content;

        return (
            <img src={message_content} alt='image' />
        );
    }
});

module.exports = Image;
