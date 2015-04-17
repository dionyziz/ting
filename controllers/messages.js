var MessagesCtrl = function ($scope, chatServer) {
    $scope.messages = channel.messages;

    $scope.sendMessage = function() {
        console.log('Sending message: ' + $scope.outgoingMessage);
        chatServer.emit('message', {
            channel: channel.name,
            message: $scope.outgoingMessage
        });
        $scope.outgoingMessage = '';
    };

    chatServer.on('message', function(params) {
        var channelName = params.channel,
            messageText = params.message,
            sourceNickname = params.source;

        if (channelName != channel.name) {
            return false;
        }

        $scope.messages.push(new Message(messageText, sourceNickname));
    });
};
