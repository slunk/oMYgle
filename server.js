var connect = require('connect'),
    http = require('http'),
    socketio = require('socket.io'),
    unmatchedUsers = [];

app = http.createServer(connect().use(connect.static('app')));
io = socketio.listen(app);

io.configure(function () {
    io.set("transports", ["websocket"]);
});

app.listen(process.env.PORT || 1337);

io.sockets.on('connection', function (socket) {
    var partner = null;
    function findNewPartner() {
        if (unmatchedUsers.length > 0) {
            var user = unmatchedUsers.shift();
            partner = user.socket;
            user.setPartner(socket);
            socket.emit("new", null);
            partner.emit("new", null);
        } else {
            unmatchedUsers.push({
                "socket": socket,
                "setPartner": function(skt) {
                    partner = skt;
                }
            });
        }
    }

    socket.on('leave', function() {
        if (partner) {
            partner.emit('leave', null);
            partner = null;
        }
    });

    socket.on('msg', function(data) {
        partner.emit('msg', data);
    });

    socket.on('new', function() {
        findNewPartner();
    });

    socket.on('disconnect', function () {
        var idx = indexOfSocket();
        if (idx >= 0) {
            unmatchedUsers.splice(idx, 1);
        }
        if (partner) {
            partner.emit('leave', null);
        }
    });

    function indexOfSocket() {
        for (var idx = 0; idx < unmatchedUsers.length; idx++) {
            if (unmatchedUsers[idx].socket.id === socket.id) {
                return idx;
            }
        }
        return -1;
    }
});
