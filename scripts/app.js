import openSocket from 'socket.io-client';
var socket = io('http://localhost')
var currentPlayer = 'Me'

var currentRoom = {
  roomName: nil
}


$('#join-game').onClick(function() {
  console.log(currentPlayer, 'wants to join a room');
  socket.emit('join-game', { player: currentPlayer });
})

// Sockets stuff.

socket.on('connection', function(){
  console.log('Client connected to socket');
});

socket.on('room-invite', function(data) {
  currentRoom.roomName = data.roomId;
  socket.join(data.roomId);
  console.log(currentPlayer, 'is trying to join room', data.roomId, 'client side');
});

socket.on('start-game'), function() {
  //some jquery bullshit to initiate game
}

//need something for when game ends