var LoginForm = React.createClass({
    usernameErrorValidation: function(username) {
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
    usernameErrorShow: function(error) {
        $('#username-alert').empty();
        var $par = $('<p></p>');
        var errors = {
            empty: 'Γράψε ένα ψευδώνυμο.',
            length: 'Το ψευδώνυμο πρέπει να είναι έως 20 γράμματα.',
            chars: 'Το ψευδώνυμο πρέπει να περιλαμβάνει μόνο γραμματα, αριθμούς ή σύμβολα.',
            taken: 'Το ψευδώνυμο το έχει άλλος.'
        };

        $par.append(errors[error]);

        $('#username-alert').append($par);
        $('#username-alert').show();
    },
    handleSubmit: function(event) {
        event.preventDefault();
        ga('send', 'event', { 
            eventCategory: 'join', eventAction: 'username_set', eventLabel: 'submit', eventValue: 1
        });

        myUsername = $('#username').val();
        var response = this.usernameErrorValidation(myUsername);

        if (response != true) {
            this.usernameErrorShow(response);
            return;
        }
        socket.emit('login', myUsername);
    },
    componentDidMount: function() {
        $('#username-set-modal').modal('show');
        $('#username-alert').hide()
        setTimeout(function() {
            $('#username').focus();
        }, 300);
    },
    render: function() {
        return (
            <div className='modal fade' id='username-set-modal' data-backdrop='static' data-keyboard='false' role='dialog'>
                <div className='modal-dialog'>
                    <div className='modal-content'>
                        <div className='text-center' id='login'>
                            <h1>Ting</h1>
                            <div className="alert alert-warning" id="username-alert" role="alert"></div>
                            <form id='username-set' onSubmit={this.handleSubmit}>
                                <input type='text' className='form-control input-small' placeholder='Γράψε ένα ψευδώνυμο' id='username' />
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
