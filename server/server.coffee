express = require 'express'
http    = require 'http'
io      = require 'socket.io'
_       = require 'lodash'

Channel = require '../models/channel.js'

app = express()
server = http.Server(app)
io = io(server)

app.use(express.static(__dirname + '/../'))

socketToUser = {}
channels = {}

io.on 'connection', (socket) ->
  user = null

  console.log(socket.id + ' connected')

  socket.on 'register', (me) ->
    user = me
    console.log 'me me', me
    socketToUser[socket.id] = user
    console.log(socket.id + ' is now known as ' + me.nickname)

  socket.on 'join', (channel) ->
    console.log(user.nickname + ' joins channel #' + channel.name)

    channels[channel.name] ?= new Channel(channel.name)

    if not channels[channel.name].users[user.nickname]
      channels[channel.name].users[user.nickname] = user

    socket.emit('nicklist', channels[channel.name])

    io.emit('join', {user, channel})

  socket.on 'message', ({channel, message}) ->
    if not channels[channel]?.users[user.nickname]
      console.log('User', user.nickname,
                  'tried to send message to #', channel,
                  'but is not in channel')
      return

    console.log('On #' + channel, '<' + user.nickname + '>',  message)

    io.emit('message',
      channel: channel
      message: message
      source: user.nickname
    )

  socket.on 'disconnect', ->
    io.emit('part', {user})

server.listen 3000, ->
  console.log('listening on *:3000')
