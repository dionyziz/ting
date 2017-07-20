const React = require('react'),
      ReactDOM = require('react-dom'),
      i18n = require('i18next-client'),
      io = require('socket.io-client'),
      _ = require('lodash'),
      config = require('./config.jsx'),
      Route = require('react-router-dom').Route,
      HashRouter = require('react-router-dom').HashRouter,
      Switch = require('react-router-dom').Switch,
      TopBar = require('./topbar.jsx'),
      Ting = require('./ting.jsx'),
      Settings = require('./settings.jsx');

const App = React.createClass({
    _socket: null,
    getInitialState() {
        return {
            username: null,
            people: [],
        };
    },
    componentWillMount() {
        const URL = window.location.hostname + ':' + config.port;
        this._socket = io.connect(URL, {secure: config.websocket.secure});
    },
    updateUsername(username) {
        this.setState({username});
    },
    onLoginIntention(username, people) {
        this.setState({username, people});
    },
    removeListener(listener, func) {
        this._socket.removeListener(listener, func);
    },
    addListener(listener, func) {
        this._socket.on(listener, func);
    },
    render() {
        return (
            <HashRouter>
                <Switch>
                    <Route exact path='/' render={(props) => (
                        <Ting {...props} username={this.state.username}
                                         people={this.state.people}
                                         onLoginIntention={this.onLoginIntention}
                                         updateUsername={this.updateUsername}
                                         socket={this._socket}
                                         removeListener={this.removeListener}
                                         addListener={this.addListener} />
                    )} />
                    <Route exact path='/settings' render={(props) => (
                        <Settings {...props} username={this.state.username} />
                    )} />
                </Switch>
            </HashRouter>
        );
    }
});

i18n.init(
    {
        resGetPath:' locales/__lng__.json',
        lng: 'el-GR'
    },
    () => {
        ReactDOM.render(<App />, document.getElementsByClassName('ting')[0]);
    }
);
