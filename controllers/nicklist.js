var NicklistCtrl = function ($scope, chatServer) {
    $scope.users = {};

    chatServer.on('join', function(params) {
        var channel = params.channel,
            user = params.user;

        if (!$scope.users[user.name]) {
            $scope.users[user.name] = true;
        }
    });

    chatServer.on('nicklist', function(channelUserNicknames) {
        console.log('Received nicklist', channelUserNicknames);

        $scope.users = channelUserNicknames;
    });

    chatServer.on('part', function(params) {
        var channel = params.channel,
            user = params.user;

        delete $scope.users[user.name];
    });
};
