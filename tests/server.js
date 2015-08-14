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

    describe('on login', function(done) {
        it('joins a user to Ting', function(done) {
            socket.emit('login', 'Tattaglia');

            socket.on('login-response', function(success) {
                expect(success).toBe(true);
                done();
            });
        });

        it('updates online people list', function(done) {
            socket.emit('login', 'Corleone');

            socket.on('update-people', function(people) {
                id = Object.keys(people)[0];
                expect(people[id]).toBe('Corleone');
                done();
            }); 
        });
    });

    describe('on chat', function(done) {
        it('emits the message to sockets', function(done) {
            var data = {type: 'channel', target: 'ting', text: 'Brucia la luna ncielu E ju bruciu damuri'};

            socket.emit('login', 'Stracci');
            socket.emit('message', data);

            socket.on('message', function(data) {
                expect(data.username).toBe('Stracci');
                expect(data.text).toBe('Brucia la luna ncielu E ju bruciu damuri');
                done();
            });
        });
    });
});
