var React = require('react');
var Avatar = require('./avatar.jsx');

var UserList = React.createClass({
    getInitialState() {
        return {
            users: [],
            myUsername: null
        };
    },
    onLogin(myUsername, users) {
        this.setState({myUsername, users});
    },
    onJoin(username) {
        if (username != this.state.myUsername) {
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
    onPart(username) {
        var newUsers = this.state.users.filter((name) => {
            return username != name;
        });
        this.setState({
            users: newUsers
        });
    },
    render() {
        var userNodes = this.state.users.map((user) => {
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

module.exports = UserList;
