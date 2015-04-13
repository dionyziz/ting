var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static('../'));

var socketToUser = {};
var channels = {};

var Channel = require('../models/channel.js');
var _ = require('lodash');

io.on('connection', function(socket){
  var user = null;

  console.log(socket.id + ' connected');

  socket.on('register', function(me) {
    user = me;
    socketToUser[socket.id] = user;
    console.log(socket.id + ' is now known as ' + me.nickname);
  });
  socket.on('join', function(channel) {
    console.log(user.nickname + ' joins channel #' + channel.name);
    
    if (typeof channels[channel.name] === 'undefined') {
        channels[channel.name] = new Channel(channel.name);
    }
    
    if (!_.find(channels[channel.name].users, {'nickname': user.nickname})) {
        channels[channel.name].users.push(user);
    }

    socket.emit('nicklist', channels[channel.name]);

    io.emit('join', {
        user: user,
        channel: channel
    });
  });
  socket.on('message', function(params) {
    var channel = params.channel,
        message = params.message;

    if (!channels[channel.name]
     || !channels[channel.name].users[user.nickname]) {
        console.log('User', user.nickname,
                    'tried to send message to #', channel.name,
                    'but is not in channel');
    }

    console.log('On #' + channel.name, '<' + user.nickname + '>',  message.text);

    io.emit('message', {
        channel: channel,
        message: message
    }, {
        for: 'everyone'
    });
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

