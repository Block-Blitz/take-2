var socket = io.connect('http://localhost:8080')
var currentPlayer = 'Me'

var inGame = false;

var currentRoom = {
  roomName: ''
}


$('#join-game').on('click', function() {
  console.log(currentPlayer, 'wants to join a room');
  socket.emit('join-game', { player: currentPlayer });
});

$('#leave-queue').on('click', function() {
  console.log(currentPlayer, 'left the queue');
  // add logic to leave room
});

// Sockets stuff.

socket.on('connection', function() {
  console.log('Client connected to socket');
});

socket.on('room-invite', function(data) {
  currentRoom.roomName = data.id;
  console.log(currentPlayer, 'is trying to join room', currentRoom.roomName, '(from client side)');
});

socket.on('start-game', function() {
  inGame = true;
  //some jquery bullshit to initiate game
});

socket.on('game-over', function() {
  inGame = false;
//need something for when game ends, probably jquery bullshit
});

socket.on('leave-queue', function() {
  //need to leave the room somehow
});

socket.on('joinSuccess', function(msg) {
  console.log(msg, 'heard the client from the room');
});