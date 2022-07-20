const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const path = require('path');

app.use('/js', express.static(path.join(__dirname, '/js')));
app.use('/css', express.static(path.join(__dirname, '/css')));
app.use('/resources', express.static(path.join(__dirname, '/resources')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/PlayScreen.html'));
});

server.listen(3001, () => {
    console.log('listening on *:3001');
});

var players = {};

io.on('connection',function(socket){
    socket.on('newplayer',function(){
        players[socket.id] = {
            playerId: socket.id,
            x: Math.floor(Math.random() * 300) + 100, //random int from 100 to 400
            y: Math.floor(Math.random() * 300) + 100
        };
        socket.emit('currentPlayers', players);
        socket.broadcast.emit('newplayer', players[socket.id]);
        // socket.emit('newplayer', players[socket.id]);
    });

    socket.on('playerMoved',function(direction){
        socket.broadcast.emit('moveEnemy', direction);
    });

});

// io.on('disconnect', function (socket){
//     console.log('destroy from server!!');
//     delete players[socket.id];
//     io.broadcast.emit('disconnect', socket.id);
// });

// function getAllPlayers(){
//     var players = [];
//     Object.keys(io.sockets.connected).forEach(function(socketID){
//         var player = io.sockets.connected[socketID].player;
//         if(player) players.push(player);
//     });
//     return players;
// }