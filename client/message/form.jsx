const React = require('react/addons'),
      i18n = require('i18next-client');

const MessageForm = React.createClass({
    _MIN_UPDATE: 3000,
    _lastUpdate: 0,
    _lastUpdateTimeout: null,
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
        var message = event.target.value;

        if (message.trim().length > 0) {
            if (this.state.message == '') {
                this.props.onStartTyping(message);
            }
            else if (Date.now() - this._lastUpdate >= this._MIN_UPDATE) {
                this.props.onTypingUpdate(message);
                this._lastUpdate = Date.now();
                clearTimeout(this._lastUpdateTimeout);
            }
            else {
                clearTimeout(this._lastUpdateTimeout);
                this._lastUpdateTimeout = setTimeout(() => {
                    this.props.onTypingUpdate(message);
                }, this._MIN_UPDATE);
            }
        }
        else if (this.state.message.trim().length > 0) { // message was deleted
            this.props.onTypingUpdate(message);
        }
        this.setState({message});
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
