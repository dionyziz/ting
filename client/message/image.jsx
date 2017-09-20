const React = require('react');

class Image extends React.Component {
    render() {
        var message_content = this.props.message_content;

        return (
            <div>
                <img className='content_image' src={message_content} alt='image' />
            </div>
        );
    }
}

module.exports = Image;
