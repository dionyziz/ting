var LoginForm = React.createClass({
    getInitialState: function() {
        return {
            validationState: true,
            errorStr: '',
            username: ''
        };
    },
    _validate: function(username) {
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
    _validationErrorToString: function(validationState) {
        var errors = {
            empty: 'Γράψε ένα ψευδώνυμο.',
            length: 'Το ψευδώνυμο πρέπει να είναι έως 20 γράμματα.',
            chars: 'Το ψευδώνυμο πρέπει να περιλαμβάνει μόνο γραμματα, αριθμούς ή σύμβολα.',
            taken: 'Το ψευδώνυμο το έχει άλλος.',
            true: ''
        };

        return errors[validationState];
    },
    handleChange: function(event) {
        var username = event.target.value;
        var validationState = this._validate(username);
        var errorStr = this._validationErrorToString(validationState);

        this.setState({
            username: username,
            validationState: validationState,
            errorStr: errorStr
        });
    },
    handleSubmit: function(event) {
        event.preventDefault();

        if (this.state.validationState !== true) {
            return;
        }

        ga('send', 'event', {
            eventCategory: 'join', eventAction: 'username_set', eventLabel: 'submit', eventValue: 1
        });
        socket.emit('login', myUsername);
    },
    componentDidMount: function() {
        $('#username-set-modal').modal('show');
        setTimeout(function() {
            $('#username').focus();
        }, 300);
    },
    render: function() {
        var alertClasses = classNames({
            'alert': true,
            'alert-warning': true,
            'hidden': this.state.validationState === true
        });

        return (
            <div className='modal fade' id='username-set-modal' data-backdrop='static' data-keyboard='false' role='dialog'>
                <div className='modal-dialog'>
                    <div className='modal-content'>
                        <div className='text-center' id='login'>
                            <h1>Ting</h1>
                            <div className={alertClasses} id="username-alert" role="alert">
                                <p>{this.state.errorStr}</p>
                            </div>
                            <form id='username-set' onSubmit={this.handleSubmit}>
                                <input type='text' className='form-control input-small' placeholder='Γράψε ένα ψευδώνυμο' id='username' onChange={this.handleChange} />
                                <input type='submit' name='join' id='join' value='Mπες' className='btn btn-primary' />
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});
React.render(<LoginForm />, document.getElementById('container'));
