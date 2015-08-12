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
     client.on('login', function(username) {
        var resp = { 
            success: true
        };
        if (usernames[username]) {
            resp.success = false;
            resp.error = 'taken';
            client.emit('login-response', resp);
            return;
        }
        people[client.id] = username;
        usernames[username] = true;
        resp.people = people;
        console.log(username + ' joined the server');
        client.emit('login-response', resp);
        socket.sockets.emit('join', username);
    });

    client.on('message', function(data) {
        var text = data.text;
        data.username = people[client.id];
        socket.sockets.emit('message', data);
        console.log(people[client.id] + 'sent "' + text + '"');

        var headers = {
            'User-Agent':       'node-ting/0.1.0',
            'Content-Type':     'application/x-www-form-urlencoded'
        }

        var options = {
            url: URL + '/api/messages/' + data.target + '/',
            method: 'POST',
            headers: headers,
            form: {
                'username': people[client.id],
                'text': data.text,
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
        socket.sockets.emit('part', username);
        console.log(username + ' disconnected from server');
    });
});
