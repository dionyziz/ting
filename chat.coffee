chat = angular.module('chat', ['btford.socket-io'])

window.channel = new Channel('hellas')
window.me = null

chat.factory 'chatServer', (socketFactory) ->
    url = '/'

    if location.port isnt ''
        url = ':' + location.port + '/'

    return socketFactory(ioSocket: io.connect(url))

chat.controller('MessagesCtrl', MessagesCtrl)
chat.controller('NicklistCtrl', NicklistCtrl)

chat.run (chatServer) ->
    if not localStorage['nickname']
        nickname = prompt('Πληκτρολόγησε το όνομά σου:')
        localStorage['nickname'] = nickname
    else
        nickname = localStorage['nickname']

    me = new User(nickname)

    $('#chat').show()

    chatServer.on 'connect', ->
        chatServer.emit('register', me)
        chatServer.emit('join', channel)

angular.element(document).ready ->
    angular.bootstrap(document.body, ['chat'])
