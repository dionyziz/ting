$(document).ready(function() {
    URL = 'www.ting.gr:8080';
    var ENTER = 13;
    var ready = false;
    var rex = /^[α-ωa-z0-9]+$/i;
    var wrapper = $('.history-wrapper');
    var myUsername = null;
    var socket = io.connect(URL);

    function scrollDown() {
        setTimeout(function() {
            wrapper.scrollTop(wrapper.get(0).scrollHeight);
        }, 30);
    }

    $('#username-set-modal').modal('show');
    setTimeout(function() {
        $('#username').focus();
    }, 300);

    $('#join').click(function() {
        var username = $('#username').val();
        if (username == '' && rex.test(username)) {
            alert('Please enter a valid username');
        }
        socket.emit('join', username);
        ready = true;
        $('#modal').modal('hide');
        $('#msg input').focus();
    });
        
    var url = $(location).attr('href');
    parts = url.split('/');
    var channel = parts[1];

    if (channel == 'undefined') {
        channel = 'ting';
    }

    function getAvatar(name) {
        return 'http://www.gravatar.com/avatar/' + md5(name.toLowerCase() + '@gmail.com');
    }

    $.getJSON('/api/messages/' + channel, function(msgs) {
        $.each(msgs, function(index, msg) {
            var src = getAvatar(msg.username);
            var $img = $('<img src="' + src + '" alt="' + msg.username + '" class="avatar" />');
            var $li = $('<li></li>');

            $li.append($img);
            $li.append(document.createTextNode(' '));
            $li.append($('<strong>' + msg.username + '</strong>'));
            $li[0].innerHTML += ' <div class="other">' + msg.text + '</div>';

            $('#msg-list').prepend($li);
        });
        scrollDown();
    });

    $('#modal').modal('show');
    $('#username').focus();
        
    $('#username-set').submit(function(event) {
        event.preventDefault();
        var username = $('#username').val();
        if (username != '' && rex.test(username)) {
            socket.emit('join', username);
            myUsername = username;
            ready = true;
            $('#modal').modal('hide');
            $('#msg input').focus();
        }
        else {
            alert('Please enter a valid username');
        }
    });

    $('#msg input').keypress(function(e) {
        if (e.which == ENTER) {
            e.preventDefault();
            var msg = $('#msg input').val();
            if (msg != '') {
                data = { ch: channel, msg: msg };
                socket.emit('send', data);
                $('#msg input').val('');
                scrollDown();
            }
        }
    });

    socket.on('update', function(msg) {
        if (ready) {
            $('#msg-list').append('<li>' + msg + '</li>');
            scrollDown();
        }
    });

    socket.on('update-people', function(people) {
        if (ready) {
            $('#online-list').empty();
            $.each(people, function(clientid, name) {
                $('#online-list').append('<li>' + name + '</li>');
            });
        }
    });

    socket.on('chat', function(who, msg) {
        if (ready) {
            var avatarHTML = '<img src="' + getAvatar(who) + '" alt="' + who + '" class="avatar"/>';
            var className;

            if (who == myUsername) {
                className = 'self';
            }
            else {
                className = 'other';
            }

            var html = '<li>' + avatarHTML + ' <strong>' + who + '</strong> <div class="' + className + '">' + msg + '</div></li>';

            $('#msg-list').append(html);
            scrollDown();
        }
    });

    //socket.on('disconnect', function() {
    //    $('#msgs').append('<li><strong><span class='text-warning'>The server is not available</span></strong></li>');
    //    $('#msg').attr('disabled', 'disabled');
    //    $('#send').attr('disabled', 'disabled');
    //});
});
