var io = require('socket.io');
var req = require('request');
URL = 'ting.gr/messages/';
PORT = 8080;

var socket = io.listen(PORT);

var people = {};

socket.on('connection', function (client) {
    client.on('join', function(name) {
        people[client.id] = name;
        console.log(name + ' joined the server');
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
            url: URL + data.ch,
            method: 'POST',
            headers: headers,
            form: {
                'username': people[client.id],
                'msg': data.msg,
                'datetime': Date.now() 
            }
        }

        request(headers, function(error, response, body) {
             if (error) {
                 console.log(error);
             } 
        });
    });

    client.on('disconnect', function() {
        var user = people[client.id];
        delete people[client.id];
        socket.sockets.emit('update-people', people);
        console.log(user + ' disconnected from server');
    });
});
