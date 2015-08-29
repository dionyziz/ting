var React = require('react');
var i18n = require('i18next-client');
var classNames = require('classnames');

var LoginForm = React.createClass({
    getInitialState() {
        return {
            validationState: true,
            errorStr: '',
            username: '',
            changed: false
        };
    },
    _validate(username) {
        var rex = /^[α-ωa-z0-9]+$/i;

        if (username == '') {
            return 'empty';
        }
        else if (username.length > 20) {
            return 'length';
        }
        else if (!rex.test(username)) {
            return 'chars';
        } 
        return true;
    },
    _handleError(validationState) {
        this.setState({
            validationState: validationState,
            errorStr: i18n.t('usernameSet.errors.' + validationState)
        });
    },
    _onUsernameChanged(username) {
        var validationState = this._validate(username);

        this.setState({username});
        if (!this.state.changed) {
            this.setState({
                changed: true
            });
        }

        this._handleError(validationState);
    },
    onError(error) {
        this._handleError(error);
    },
    onSuccess() {
        $(React.findDOMNode(this.refs.usernameSetModal)).modal('hide');
    },
    handleChange(event) {
        this._onUsernameChanged(event.target.value);
    },
    handleSubmit(event) {
        event.preventDefault();

        if (!this.state.changed) {
            this._onUsernameChanged('');
            return;
        }

        if (this.state.validationState !== true) {
            return;
        }

        this.props.onLoginIntention(this.state.username);
    },
    componentDidMount() {
        $(React.findDOMNode(this.refs.usernameSetModal)).modal('show');
        setTimeout(() => {
            React.findDOMNode(this.refs.username).focus();
        }, 300);
    },
    render() {
        var alertClasses = classNames({
            'alert': true,
            'alert-warning': true,
            'hidden': this.state.validationState === true
        });

        return (
            <div className='modal fade'
                 ref='usernameSetModal'
                 data-backdrop='static'
                 data-keyboard='false'
                 role='dialog'>
                <div className='modal-dialog'>
                    <div className='modal-content'>
                        <div className='text-center'
                             id='login'>
                            <h1>Ting</h1>
                            <div className={alertClasses}
                                 role='alert'>
                                <p>{this.state.errorStr}</p>
                            </div>
                            <form id='username-set'
                                  onSubmit={this.handleSubmit}>
                                <input type='text'
                                       className='form-control input-small'
                                       placeholder={i18n.t('usernameSet.placeholder')}
                                       ref='username'
                                       onChange={this.handleChange} />
                                <input type='submit'
                                       name='join'
                                       id='join'
                                       value={i18n.t('usernameSet.submit')}
                                       className='btn btn-primary' />
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = LoginForm;
