var io = require('socket.io-client');

describe('Node Server', function() {
    var socket;

    beforeEach(function(done) {
        socket = io.connect('http://localhost:8080', {
            'reconnection delay': 0,
            'reopen delay': 0,
            'force new connection': true
        });
        socket.on('connect', function() {
            done();
        });
    });

    afterEach(function(done) {
        if (socket.connected) {
            socket.disconnect();
        }
        done();
    });

    describe('on connection', function() {
        it('connects to the server', function(done) {
            expect(socket.connected).toBeTruthy();
            done();
        });
    });

    describe('on join', function(done) {
        it('joins a user to Ting', function(done) {
            socket.emit('join', 'Tattaglia');

            socket.on('join-response', function(success) {
                expect(success).toBe(true);
                done();
            });
        });

        it('updates online people list', function(done) {
            socket.emit('join', 'Corleone');

            socket.on('update-people', function(people) {
                id = Object.keys(people)[0];
                expect(people[id]).toBe('Corleone');
                done();
            }); 
        });
    });

    describe('on chat', function(done) {
        it('emits the message to sockets', function(done) {
            var data = {ch: 'ting', msg: 'Brucia la luna ncielu E ju bruciu damuri'};

            socket.emit('join', 'Stracci');
            socket.emit('send', data);

            socket.on('chat', function(data) {
                expect(data.who).toBe('Stracci');
                expect(data.msg).toBe('Brucia la luna ncielu E ju bruciu damuri');
                done();
            });
        });
    });
});
