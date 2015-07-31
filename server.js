var io = require('socket.io');
var req = require('request');
var fs = require('fs');

var config = JSON.parse(fs.readFileSync('config/common.json', 'utf8'))

if (fs.existsSync('config/local.json')) {
    config = JSON.parse(fs.readFileSync('config/local.json', 'utf8'))
}

URL = 'http://' + config.node.hostname;
PORT = config.node.port;

var socket = io.listen(PORT);

var people = {};
var usernames = {};

socket.on('connection', function (client) {
     client.on('join', function(username) {
        if (usernames[username]) {
            client.emit('join-response', false);
            return;
        }
        people[client.id] = username;
        usernames[username] = true;
        console.log(username + ' joined the server');
        client.emit('join-response', true);
        socket.sockets.emit('update-people', people);
    });

    client.on('send', function(data) {
        var message = data.message;
        data.username = people[client.id]
        socket.sockets.emit('chat', data);
        console.log(people[client.id] + 'sent "' + message + '"');

        var headers = {
            'User-Agent':       'node-ting/0.1.0',
            'Content-Type':     'application/x-www-form-urlencoded'
        }

        var options = {
            url: URL + '/api/messages/' + data.channel + '/',
            method: 'POST',
            headers: headers,
            form: {
                'username': people[client.id],
                'text': data.message,
                'datetime': Date.now() 
            }
        }

        req(options, function(error, response, body) {
            if (error) {
                console.log(error);
            }
        });
    });

    client.on('disconnect', function() {
        var username = people[client.id];
        delete people[client.id];
        delete usernames[username];
        socket.sockets.emit('update-people', people);
        console.log(username + ' disconnected from server');
    });
});
