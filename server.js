var io = require('socket.io');
var req = require('request');
var fs = require('fs');
var winston = require('winston');

winston.add(winston.transports.File, { filename: 'server.log' });

var config = JSON.parse(fs.readFileSync('config/common.json', 'utf8'))

if (fs.existsSync('config/local.json')) {
    config = JSON.parse(fs.readFileSync('config/local.json', 'utf8'))
}

URL = 'http://' + config.node.hostname;
PORT = config.node.port;

var socket = io.listen(PORT);

var people = {};
var usernames = {};

function logUsersCount() {
    winston.info('Currently ' + Object.keys(usernames).length + ' users are logged in the server.');
}

winston.info('Ting real-time server v1 listening on port ' + config.node.port + '.');

socket.on('connection', function (client) {
     winston.info('A user with client id "' + client.id + '" connected.'); 
     client.on('login', function(username) {
        var resp = { 
            success: true
        };
        if (usernames[username]) {
            winston.info('[' + username + '] taken'); 
            resp.success = false;
            resp.error = 'taken';
            client.emit('login-response', resp);
            return;
        }
        people[client.id] = username;
        usernames[username] = true;
        resp.people = people;
        winston.info('[' + username + '] login');
        logUsersCount();
        client.emit('login-response', resp);
        socket.sockets.emit('join', username);
    });

    client.on('message', function(data) {
        var text = data.text;
        data.username = people[client.id];
        socket.sockets.emit('message', data);
        winston.info('[' + data.username + '] message: ' + text);

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
                winston.warning("Message from user: " + data.username + " couldn't be sent to Django. Error: " + error);
            }
        });
    });

    client.on('disconnect', function() {
        var username = people[client.id];
        delete people[client.id];
        delete usernames[username];
        socket.sockets.emit('part', username);
        winston.info('[' + username + '] disconnect');
        logUsersCount();    
    });
});
