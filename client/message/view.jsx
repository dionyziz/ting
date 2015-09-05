const React = require('react/addons'),
      Avatar = require('../avatar.jsx'),
      escape = require('escape-html'),
      emoticons = require('emoticons'),
      autolinks = require('autolinks');

const Message = React.createClass({
    _formatMessage(message) {
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
    },
    render() {
        var className, text = this.props.text;

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
            text = '...';
        }

        return (
            <li>
                <Avatar username={this.props.username} />
                <strong>{this.props.username}</strong>

                <div className={className}
                     dangerouslySetInnerHTML={this._formatMessage(text)}>
                </div>
            </li>
        );
    }
});

module.exports = Message;
