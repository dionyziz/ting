var chat = angular.module('chat', ['btford.socket-io']);

var channel = new Channel('hellas');
var me = null;

chat.factory('chatServer', function (socketFactory) {
    var url = '/';

    if (location.port != '') {
        url = ':' + location.port + '/';
    }
    return socketFactory({ioSocket: io.connect(url)})
});

chat.controller('MessagesCtrl', MessagesCtrl);
chat.controller('NicklistCtrl', NicklistCtrl);

chat.run(function(chatServer) {
    var nickname;

    if (!localStorage['nickname']) {
        nickname = prompt('Πληκτρολόγησε το όνομά σου:');
        localStorage['nickname'] = nickname;
    }
    else {
        nickname = localStorage['nickname'];
    }

    me = new User(nickname);

    $('#chat').show();

    chatServer.on('connect', function() {
        chatServer.emit('register', me);
        chatServer.emit('join', channel);
    });
});
