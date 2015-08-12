var LoginForm = React.createClass({
    getInitialState() {
        return {
            validationState: true,
            errorStr: '',
            username: ''
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
    _validationErrorToString(validationState) {
        var errors = {
            empty: 'Γράψε ένα ψευδώνυμο.',
            length: 'Το ψευδώνυμο πρέπει να είναι έως 20 γράμματα.',
            chars: 'Το ψευδώνυμο πρέπει να περιλαμβάνει μόνο γραμματα, αριθμούς ή σύμβολα.',
            taken: 'Το ψευδώνυμο το έχει άλλος.',
            true: ''
        };

        return errors[validationState];
    },
    _handleError(validationState) {
        this.setState({
            validationState: validationState,
            errorStr: this._validationErrorToString(validationState)
        });
    },
    handleChange(event) {
        var username = event.target.value;
        myUsername = username;

        var validationState = this._validate(username);

        this.setState({
            username: username,
        });
        this._handleError(validationState);
    },
    handleSubmit(event) {
        event.preventDefault();

        if (this.state.validationState !== true) {
            return;
        }

        ga('send', 'event', {
            eventCategory: 'join', eventAction: 'username_set', eventLabel: 'submit', eventValue: 1
        });
        socket.emit('login', myUsername);
    },
    componentDidMount() {
        $(React.findDOMNode(this.refs.usernameSetModal)).modal('show');
        setTimeout(() => {
            React.findDOMNode(this.refs.username).focus();
        }, 300);

        socket.on('login-response', (success) => {
            if (!success) {
                this._handleError('taken');
                return;
            }
            ready = true;

            $(React.findDOMNode(this.refs.usernameSetModal)).modal('hide');
            $('#message input').focus();

            updateOwnMessagesInHistory();
        });
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
                                 role="alert">
                                <p>{this.state.errorStr}</p>
                            </div>
                            <form id='username-set'
                                  onSubmit={this.handleSubmit}>
                                <input type='text'
                                       className='form-control input-small'
                                       placeholder='Γράψε ένα ψευδώνυμο'
                                       ref='username'
                                       onChange={this.handleChange} />
                                <input type='submit'
                                       name='join'
                                       id='join'
                                       value='Mπες'
                                       className='btn btn-primary' />
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});
