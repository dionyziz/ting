const React = require('react'),
      ReactDOM = require('react-dom'),
      i18n = require('i18next-client');

const MessageForm = React.createClass({
    _MIN_UPDATE_WHILE_TYPING: 2000,
    _MIN_UPDATE_WHEN_STOPPED: 500,
    _lastUpdate: 0,
    _lastUpdateTimeout: null,
    _imageData: null,
    _typeLastMessage: null,
    getInitialState() {
        return {
            message: ''
        };
    },
    handleSubmit(event) {
        event.preventDefault();

        var message = this.state.message;

        if (message.trim().length > 0) {
            if (!this.props.onMessageSubmit(message, 'text')) {
                return;
            }

            ReactDOM.findDOMNode(this.refs.inputField).value = '';
        }

        this.setState({
            message: ''
        });
    },
    onLogin() {
        ReactDOM.findDOMNode(this.refs.inputField).focus();
    },
    handleChange(event) {
        var message = event.target.value;
        this._typeLastMessage = 'text';

        if (message.trim().length > 0) {
            if (this.state.message.trim() == '') {
                this.props.onStartTyping(message, 'text');
            }
            else if (Date.now() - this._lastUpdate >= this._MIN_UPDATE_WHILE_TYPING) {
                this.props.onTypingUpdate(message);
                this._lastUpdate = Date.now();
                clearTimeout(this._lastUpdateTimeout);
            }
            else {
                clearTimeout(this._lastUpdateTimeout);
                this._lastUpdateTimeout = setTimeout(() => {
                    this.props.onTypingUpdate(message);
                }, this._MIN_UPDATE_WHEN_STOPPED);
            }
        }
        else if (this.state.message.trim().length > 0) { // message was deleted
            this.props.onTypingUpdate(message);
        }
        this.setState({message});
    },
    onImageLoaded(event) {
        this._imageData = event.target.result;
        this.props.onStartTyping(this._imageData, 'image');
    },
    onStartTypingResponse(messageid) {
        if (this._typeLastMessage == 'image') {
            this.props.onMessageSubmit(this._imageData, 'image');
        }
    },
    loadImage(src) {
        var reader = new FileReader();
        reader.onload = this.onImageLoaded;
        reader.readAsDataURL(src);
    },
    handleDrop(event) {
        event.preventDefault();
        this._typeLastMessage = 'image';
        var data = event.dataTransfer.files[0];
        this.loadImage(data);
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
                           onDrop={this.handleDrop}
                           ref='inputField' />
                </form>
            </div>
        );
    }
});

module.exports = MessageForm;
