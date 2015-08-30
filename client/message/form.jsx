const React = require('react/addons'),
      i18n = require('i18next-client');

const MessageForm = React.createClass({
    getInitialState() {
        return {
            message: ''
        };
    },
    handleSubmit(event) {
        event.preventDefault();

        var message = this.state.message;

        if (message.trim().length > 0) {
            this.props.onMessageSubmit(message);

            React.findDOMNode(this.refs.inputField).value = '';
        }

        this.setState({
            message: ''
        });
    },
    onLogin() {
        React.findDOMNode(this.refs.inputField).focus();
    },
    handleChange(event) {
        this.setState({
            message: event.target.value
        });
    },
    render() {
        return (
            <div className='textarea'>
                <form id='message'
                      onSubmit={this.handleSubmit}>
                    <input type='text'
                           className='form-control'
                           placeholder={i18n.t('messageInput.placeholder')}
                           value={this.state.message}
                           onChange={this.handleChange}
                           ref='inputField' />
                </form>
            </div>
        );
    }
});

module.exports = MessageForm;
