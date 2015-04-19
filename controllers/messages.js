var MessagesCtrl = function ($scope, chatServer) {
    $scope.messages = [];

    $scope.sendMessage = function() {
        console.log('Sending message "' + $scope.outgoingMessage + '" to channel', channel.name);
        chatServer.emit('message', {
            channelName: channel.name,
            message: $scope.outgoingMessage
        });
        $scope.outgoingMessage = '';
    };

    chatServer.on('message', function(params) {
        var channelName = params.channelName,
            messageText = params.message,
            sourceNickname = params.source;

        if (channelName != channel.name) {
            return false;
        }

        $scope.messages.push(new Message(messageText, sourceNickname));

        var lastMessage = $('#messages .history li:last-child');
        
        if (lastMessage.length) {
            lastMessage[0].scrollIntoView();
        }
    });
};
