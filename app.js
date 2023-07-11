const express = require('express');
const socket = require('socket.io');

const app = express();


const server = app.listen((process.env.PORT || 3000), function () {
    console.log('Listening on port 3000')
});

let io = socket(server);


app.use(express.static('public'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/hello.html')
});

app.get('/host', function (req, res) {
    res.sendFile(__dirname + '/public/host.html')
});

app.get('/guest', function (req, res) {
    res.sendFile(__dirname + '/public/guest.html');
});

app.get('/ondes-host', function (req, res) {
    res.sendFile(__dirname + '/public/ondes-host.html')
});

app.get('/ondes-guest', function (req, res) {
    res.sendFile(__dirname + '/public/ondes-guest.html');
});

io.on('connection', function (socket) {
    console.log('Made socket connection', socket.id);
    socket.on('offerTransport-1', function (data) {
        io.sockets.emit('offerTransport-1', data)
    });
    socket.on('answerTransport-1', function (data) {
        io.sockets.emit('answerTransport-1', data)
    });
    socket.on('score', function (data) {
        io.sockets.emit('score', data)
    });
});