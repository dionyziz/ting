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
    
    if (!channels[channel.name].users[user.nickname]) {
        channels[channel.name].users[user.nickname] = user;
    }

    socket.emit('nicklist', channels[channel.name]);

    io.emit('join', {
        user: user,
        channel: channel
    });
  });
  socket.on('message', function(params) {
    var channelName = params.channel,
        messageText = params.message;

    if (!channels[channelName]
     || !channels[channelName].users[user.nickname]) {
        console.log('User', user.nickname,
                    'tried to send message to #', channelName,
                    'but is not in channel');
    }

    console.log('On #' + channelName, '<' + user.nickname + '>',  messageText);

    io.emit('message', {
        channel: channelName,
        message: messageText,
        source: user.nickname
    });
    });
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

