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
     client.on('join', function(name) {
        if (usernames[name]) {
            client.emit('join-response', false);
            return;
        }
        people[client.id] = name;
        usernames[name] = true;
        console.log(name + ' joined the server');
        client.emit('join-response', true);
        socket.sockets.emit('update-people', people);
    });

    client.on('send', function(data) {
        msg = data.msg;
        socket.sockets.emit('chat', people[client.id], data.msg);
        console.log(people[client.id] + 'sent "' + msg + '"');

        var headers = {
            'User-Agent':       'node-ting/0.1.0',
            'Content-Type':     'application/x-www-form-urlencoded'
        }

        var options = {
            url: URL + '/api/messages/' + data.ch + '/',
            method: 'POST',
            headers: headers,
            form: {
                'username': people[client.id],
                'text': data.msg,
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
        var user = people[client.id];
        delete people[client.id];
        delete usernames[user];
        socket.sockets.emit('update-people', people);
        console.log(user + ' disconnected from server');
    });
});
