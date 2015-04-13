var NicklistCtrl = function ($scope, chatServer) {
    $scope.users = [];

    chatServer.on('join', function(params) {
        var channel = params.channel,
            user = params.user;

        if (!_.find($scope.users, {nickname: user.nickname})) {
            $scope.users.push(user);
        }
    });

    chatServer.on('nicklist', function(channel) {
        console.log('Received nicklist', channel.users);

        $scope.users = channel.users;
    });
};

