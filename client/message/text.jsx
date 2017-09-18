const React = require('react'),
      escape = require('escape-html'),
      emoticons = require('emoticons'),
      autolinks = require('autolinks');

class Text extends React.Component {
    _formatMessage = (message) => {
        var html = escape(message);

        html = emoticons.replace(html);

        return {
            __html: autolinks(html, (title, url) => {
                return `<a href="${url}"
                           target="_blank"
                           rel="nofollow">
                            ${title}
                        </a>`;
            })
        };
    };

    render() {
        var message_content = this.props.message_content;

        return (
            <div dangerouslySetInnerHTML={this._formatMessage(message_content)}>
            </div>
        );
    }
}

module.exports = Text;
