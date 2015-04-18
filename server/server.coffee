express = require 'express'
http    = require 'http'
io      = require 'socket.io'
_       = require 'lodash'

Channel = require '../models/channel.js'
User = require '../models/user.js'

app = express()
server = http.Server(app)
io = io(server)

app.use(express.static(__dirname + '/../'))

userChannels = {}
channelUsers = {}

io.on 'connection', (socket) ->
  user = null

  console.log(socket.id + ' connected')

  socket.on 'register', (name) ->
    user = new User(name)
    userChannels[user.name] = {}

    console.log(socket.id + ' is now known as ' + user.name)

  socket.on 'join', (channelName) ->
    if not user.name
      console.log(socket.id + ' attempted to join channel ' + channelName + ' before registering, rejecting')
      return

    console.log(user.name + ' joins channel #' + channelName)

    channelUsers[channelName] ?= {}
    channelUsers[channelName][user.name] = true

    userChannels[user.name][channelName] = true

    socket.emit('nicklist', channelUsers[channelName])

    io.emit('join', {user, channelName})

  socket.on 'part', (user, channelName) ->
    if not user.name
      console.log(socket.id + ' attempted to part channel ' + channelName + ' before registering, rejecting')
      return

    if channelUsers[channelName]
      delete channelUsers[channelName][user.name]

    console.log(user.name + ' joins channel #' + channelName)

    io.emit('part', {user, channelName})

  socket.on 'message', ({channelName, message}) ->
    if not channelUsers[channelName]?[user.name]
      console.log('User', user.name,
                  'tried to send message to #', channelName,
                  'but is not in channel')
      return

    console.log('On #' + channelName, '<' + user.name + '>',  message)

    io.emit('message',
      channelName: channelName
      message: message
      source: user.name
    )

  socket.on 'disconnect', ->
    for channelName, _ of userChannels[user.name]
      console.log(user.name + ' has parted channel ' + channelName)
      io.emit('part', {user, channelName})

    console.log(user.name + ' has disconnected')

server.listen 3000, ->
  console.log('listening on *:3000')
