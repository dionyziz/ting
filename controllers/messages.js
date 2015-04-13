var MessagesCtrl = function ($scope, chatServer) {
    $scope.messages = channel.messages;

    $scope.sendMessage = function() {
        console.log('Sending message: ' + $scope.outgoingMessage);
        chatServer.emit('message', {
            channel: channel,
            message: new Message(me, channel, $scope.outgoingMessage, 0)
        });
        $scope.outgoingMessage = '';
    };

    chatServer.on('message', function(params) {
        var channel = params.channel,
            message = params.message;

        if (channel.name != channel.name) {
            return false;
        }

        $scope.messages.push(message);
    });
};
