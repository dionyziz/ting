var NicklistCtrl = function ($scope, chatServer) {
    $scope.users = {};

    chatServer.on('join', function(params) {
        var channel = params.channel,
            user = params.user;

        if ($scope.users[user.nickname]) {
            $scope.users[user.nickname] = user;
        }
    });

    chatServer.on('nicklist', function(channel) {
        console.log('Received nicklist', channel.users);

        $scope.users = channel.users;
    });
};
