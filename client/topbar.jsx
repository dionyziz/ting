const React = require('react'),
      Avatar = require('./avatar.jsx'),
      Link = require('react-router-dom').Link,
      i18n = require('i18next-client');

class TopBar extends React.Component {
    state = {
        username: null
    };

    onLogin = (username) => {
        this.setState({username});
    };

    onReload = (e) => {
        e.preventDefault();
        window.location.reload();
    };

    render() {
        return (
            <div className='dropdown topbar'>
                <button className='btn btn-outline-primary dropdown-toggle' id='top-btn' type='button' data-toggle='dropdown'>
                    <Avatar username={this.state.username} />
                </button>
                <ul className='dropdown-menu dropdown-menu-right'>
                    <li><Link to='/settings'>{i18n.t('topbarSet.settings')}</Link></li>
                    <li><Link to='/' onClick={this.onReload}>{i18n.t('topbarSet.logout')}</Link></li>
                </ul>
            </div>
        );
    }
}

module.exports = TopBar;
