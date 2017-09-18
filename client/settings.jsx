const React = require('react'),
      Avatar = require('./avatar.jsx'),
      Select = require('./select.jsx'),
      NavLink = require('react-router-dom').NavLink,
      i18n = require('i18next-client');

require('./css/settings.css');

class Settings extends React.Component {
    state = {
        sex: [i18n.t('gender.boy'), i18n.t('gender.girl'), i18n.t('gender.undefined')],
        cities: ['Αθήνα', 'Θεσσαλονίκη']
    };

    handleKeyDown = (e) => {
        if (e.keyCode == 27) {
            e.preventDefault();
            this.props.history.push('/');
        }
    };

    componentWillMount() {
        document.addEventListener('keydown', this.handleKeyDown);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleKeyDown);
    }

    render() {
        var currentYear = new Date().getFullYear();

        return (
            <div className='container' id='settings'>
                <div id='icon-username'>
                    <div className='icon'>
                        <Avatar username={this.props.username} />
                        <span>{i18n.t('settingsSet.changePic')}</span>
                    </div>
                    <h2>{this.props.username}</h2>
                </div>

                <form id='form'>
                    <div className='form-group row no-gutters'>
                        <label htmlFor='password' className='col-sm-5 col-form-label'>{i18n.t('settingsSet.password')}</label>
                        <div className='col-sm-7'>
                            <input className='form-control' type='password' id='password' />
                        </div>
                    </div>

                    <div className='form-group row no-gutters'>
                        <label htmlFor='email' className='col-sm-5 col-form-label'>{i18n.t('settingsSet.email')}</label>
                        <div className='col-sm-7'>
                            <input className='form-control' type='text' id='email' />
                        </div>
                    </div>

                    <div className='form-group row no-gutters'>
                        <label htmlFor='birth' className='col-sm-5 col-form-label'>{i18n.t('settingsSet.birthDate')}</label>
                        <div className='col-sm-2'>
                            <Select classProp='day form-control' idProp='birth' start={1} end={31} />
                        </div>
                        <div className='col-sm-2'>
                            <Select classProp='month form-control' start={1} end={12} />
                        </div>
                        <div className='col-sm-3'>
                            <Select classProp='year form-control' start={currentYear} end={1920} />
                        </div>
                    </div>

                    <div className='form-group row no-gutters'>
                        <label htmlFor='sex' className='col-sm-5 col-form-label'>{i18n.t('settingsSet.sex')}</label>
                        <div className='col-sm-7'>
                            <Select idProp='sex' container={this.state.sex} />
                        </div>
                    </div>

                    <div className='form-group row no-gutters'>
                        <label htmlFor='region' className='col-sm-5 col-form-label'>{i18n.t('settingsSet.region')}</label>
                        <div className='col-sm-7'>
                            <Select idProp='region' container={this.state.cities} />
                        </div>
                    </div>

                    <NavLink to='/' className='button'>
                        <button className='btn btn-primary'>{i18n.t('settingsSet.save')}</button>
                    </NavLink>
                </form>
            </div>
        );
    }
}

module.exports = Settings;
