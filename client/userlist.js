var UserList = React.createClass({
    getInitialState() {
        return {
            users: []
        };
    },
    componentDidMount() {
        socket.on('join', this._join);
        socket.on('part', this._part);
    },
    _join(username) {
        if (username != myUsername) {
            var newState = React.addons.update(
                this.state, {
                    users: {
                        $push: [username]
                    }
                }
            );
            this.setState(newState);
        }
    },
    _part(username) {
        var newUsers = this.state.users.filter((name) => {
            return username != name;
        });
        this.setState({
            users: newUsers
        });
    },
    render() {
        var userNodes = this.state.users.map(function (user) {
            return (
                <User username={user} />
            );
        });

        return (
            <ul id='online-list'>
                <li className='active'><span>ting</span></li>
                {userNodes}
            </ul>
        );
    }
});

var User = React.createClass({
    render() {
        return (
            <li>
                <Avatar username={this.props.username} />
                <span>{this.props.username}</span>
            </li>
        )
    }
});
