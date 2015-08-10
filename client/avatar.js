var Avatar = React.createClass({
    render: function() {
        var src = getAvatar(this.props.username);

        return (
            <img src={src} alt={this.props.username} className="avatar" />
        );
    }
});
