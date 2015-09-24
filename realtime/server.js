var io = require('socket.io');
var req = require('request');
var fs = require('fs');
var winston = require('winston');

winston.add(winston.transports.File, { filename: 'server.log' });
winston.level = 'debug';

var config = JSON.parse(fs.readFileSync('../config/common.json', 'utf8'));

if (fs.existsSync('../config/local.json')) {
    config = JSON.parse(fs.readFileSync('../config/local.json', 'utf8'));
}

URL = 'http://' + config.node.hostname;
PORT = config.node.port;

var socket = io.listen(PORT);

var people = {};
var usernames = {};
var messages_typing = {};

function getOptions(form, path, method) {
    var headers = {
        'User-Agent':       'node-ting/0.1.0',
        'Content-Type':     'application/x-www-form-urlencoded'
    }

    return {
        url: URL + '/api/messages/' + path + '/',
        method: method,
        headers: headers,
        form: form
    }
}

function sendLoginErrorResponse(username, client, error) {
    winston.info('Username [' + username + '] of client with id ' + client.id + ' had error ' + error + '.');
    client.emit('login-response', {
        success: false,
        error: error
    });
}

function logUsersCount() {
    winston.info('Currently ' + Object.keys(usernames).length + ' users are logged in the server.');
}

winston.info('Ting real-time server v1 listening on port ' + config.node.port + '.');
winston.debug('Debug logging is enabled. Disable it if you see too many logs.');
winston.debug('Using persistence API back-end at ' + URL);

socket.on('connection', function (client) {
    winston.info('A user with client id "' + client.id + '" connected.');
    client.on('login', function(username) {
        var rex = /^[ά-ώα-ωa-z0-9]+$/i;
        var resp = {
            success: true
        };
        if (username == '') {
            sendLoginErrorResponse(username, client, 'empty');
            return;
        }
        if (username.length > 20) {
            sendLoginErrorResponse(username, client, 'length');
            return;
        }
        if (!rex.test(username)) {
            sendLoginErrorResponse(username, client, 'chars');
            return;
        }
        if (usernames[username]) {
            sendLoginErrorResponse(username, client, 'taken');
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
        delete messages_typing[data.messageid];

        var path = data.messageid;

        var options = getOptions({
            id: data.messageid,
            text: text,
            datetime_sent: Date.now(),
            typing: false
        }, path, 'PATCH');

        req(options, function(error, response, body) {
            if (error) {
                winston.warn('Error communicating with Django with PATCH request: ' + error);
            }
        });
    });

    client.on('start-typing', function(data) {
        winston.debug('[' + people[client.id] + '] start-typing');

        var form = {
            username: people[client.id],
            text: data.text,
            target: data.target,
            datetime_start: Date.now(),
            typing: true
        };

        var path = data.type + '/' + data.target;

        var options = getOptions(form, path, 'POST');

        req(options, function(error, response, body) {
            if (error) {
                winston.error('Message from user: ' +
                    data.username +
                    " couldn't be sent to Django (" +
                    options.url +
                    "). " +
                    error);
            }
            else {
                messageid = body;

                messages_typing[messageid] = form;
                socket.sockets.emit('update-typing-messages', messages_typing);
                client.emit('start-typing-response', messageid);
            }
        });
    });

    function deletePersistentMessage(id) {
        var path = id;
        var options = getOptions({}, path, 'DELETE');

        req(options, function(error, response, body) {
            if (error) {
                winston.warn('Error communicating with Django with DELETE request: ' + error);
            }
        });
    }

    client.on('typing-update', function(data) {
        winston.debug('[' + people[client.id] + '] typing-update');

        if (!messages_typing[data.messageid]) {
            winston.warn('There is no message with id: ' + data.messageid);
            return;
        }

        if (messages_typing[data.messageid].username != people[client.id]) {
            winston.warn('messageid ' + data.messageid + ' does not belong to user ' + people[client.id]);
            return;
        }

        messages_typing[data.messageid].text = data.text;
        socket.sockets.emit('update-typing-messages', messages_typing);

        if (data.text.trim().length == 0) {
            delete messages_typing[data.messageid];

            deletePersistentMessage(data.messageid);
        }
    })

    client.on('disconnect', function() {
        var username = people[client.id];

        var messagesTypingNew = {};

        for (var messageid in messages_typing) {
            var message = messages_typing[messageid];
            if (messages_typing[messageid].username == username) {
                deletePersistentMessage(messageid);
            }
            else {
                messagesTypingNew[messageid] = message;
            }
        }

        messages_typing = messagesTypingNew;

        delete people[client.id];
        delete usernames[username];
        socket.sockets.emit('part', username);
        winston.info('[' + username + '] disconnect');
        logUsersCount();
    });
});
