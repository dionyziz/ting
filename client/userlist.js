var UserList = React.createClass({
    componentDidMount: function() {
        socket.on('join', this._join);
        socket.on('part', this._part);
    },
    render: function() {
        return (
            <ul id='online-list'></ul>
        );
    },
    _join: function(username) {
        if (username != myUsername) {
            addOnlineUserToList(username);
        }
    },
    _part: function(username) {
        $('#online-list li span').filter(function() {
            return $(this).text() == username;
        }).parent().remove();
    }
});
React.render(<UserList />, document.getElementsByClassName('nicklist')[0]);
