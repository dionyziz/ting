var React = require('react');

var Avatar = React.createClass({
    _getAvatar(username) {
        return 'https://avatars.githubusercontent.com/' + username.toLowerCase();
    },
    render() {
        if (this.props.username == null) {
            return null;
        }

        const src = this._getAvatar(this.props.username);

        return (
            <img src={src}
                 alt={this.props.username}
                 className='avatar' />
        );
    }
});

module.exports = Avatar;
