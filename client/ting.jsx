var socket = null;

var Ting = React.createClass({
    onLogin(username) {
        this.refs.history.onLogin(username);
        this.refs.userList.onLogin(username);
    },
    getInitialState() {
        var url = location.href;
        var parts = url.split('/');
        var channel = parts.slice(-1)[0]

        if (channel == '' || channel == '?') {
            channel = 'ting';
        }

        return {channel};
    },
    componentWillMount() {
        var URL = window.location.hostname + ':8080';
        socket = io.connect(URL);
    },
    render() {
        return (
            <div>
                <div className='top'>
                    <h1>Ting</h1>
                </div>
                <div className='app'>
                    <div className='nicklist'>
                        <UserList ref='userList' />
                    </div>
                    <div className='chat'>
                        <History ref='history' channel={this.state.channel} />
                        <MessageForm channel={this.state.channel} />
                    </div>
                </div>
                <LoginForm onLogin={this.onLogin} />
            </div>
        );
    }
});

React.render(<Ting />, document.getElementsByClassName('ting')[0]);
