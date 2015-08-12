var Avatar = React.createClass({
    _getAvatar: function(username) {
        return 'https://avatars.githubusercontent.com/' + escapeHTML(username.toLowerCase());
    },
    render: function() {
        var src = this._getAvatar(this.props.username);

        return (
            <img src={src} alt={this.props.username} className="avatar" />
        );
    }
});
