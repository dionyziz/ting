var Avatar = React.createClass({
    _getAvatar(username) {
        return 'https://avatars.githubusercontent.com/' + username.toLowerCase();
    },
    render() {
        var src = this._getAvatar(this.props.username);

        return (
            <img src={src} alt={this.props.username} className='avatar' />
        );
    }
});
