var socket = io.connect('http://localhost:8080')
var userData = 'Me'

var inGame = false;

var userData = {
  id: '',
  name: ''
}

var currentRoom = {
  roomName: '',
  playerOne: '',
  playerTwo: ''
}

// $.getJSON("api/user_data", function(data) {
//     // Make sure the data contains the username as expected before using it
//     console.log('api return data'. data);
//     // if (data.hasOwnProperty('user_id')) {
//       // console.log('User ID: ' + data.user_id);
//       // userData.id = data.user_id;
//     // }
// });

$.ajax({
  method: "GET",
  url: "api/user_data"
  }).done((user) => {
    userData.id = user.data.id;
    userData.name = user.data.name;
  });

// Logic for the Puzzle

var grid = document.querySelector('.grid');
var pckry = new Packery( grid, {
  itemSelector: '.tile',
  columnWidth: 100,
  transitionDuration: '0.3s'
});

pckry.getItemElements().forEach( function( itemElem ) {
  var draggie = new Draggabilly( itemElem );
  pckry.bindDraggabillyEvents( draggie );
});

// map items by their data-tile
var mappedItems = {};

pckry.items.forEach( function( item ) {
  var attr = item.element.getAttribute('data-tile');
  mappedItems[ attr ] = item;
});

// ( function() {

var orders = [
  'fmgdbalkjihec', //remove later
  'abcdefghijklm',
  'ecdibmhfajkgl',
  'ilckfgdebhjam'
];

var orderIndex = 0;

function shuffleTiles() {
  // shuffle items
  orderIndex++;
  var order = orders[ orderIndex % 3 ];
  pckry.items = order.split('').map( function( attr ) {
    return mappedItems[ attr ];
  });
  // stagger transition
  pckry._resetLayout();
  pckry.items.forEach( function( item, i ) {
    setTimeout( function() {
      pckry.layoutItems( [ item ] );
    }, i * 34 );
  });
}

var dialog = document.querySelector('.dialog');
var didWin = false;

function win() {
  if ( !didWin ) {
    document.querySelector('.dialog__text').innerHTML = 'Nice work!';
  }
  //add logic for disconnecting socket, saving the results
  didWin = true;
  socket.emit('game-over', {
    room: currentRoom,
    msg: 'Game Over!',
    winner: userData.name
  });
  showDialog();
}

function showDialog() {
  dialog.classList.remove('is-waiting');
}


document.querySelector('.shuffle-button').onclick = shuffleTiles;

pckry.on( 'dragItemPositioned', function() {
  var order = pckry.items.map( function( item ) {
    return item.element.getAttribute('data-tile');
  }).join('');
  if ( pckry.maxY === 500 && order === 'fmgdbalkjihce' ) {
    win();
  }
});

// })();


// Socket.io logic

socket.on('connection', function() {
  console.log('Client connected to socket');
});

socket.on('start-game', function(data) {
  inGame = true;
  //some jquery bullshit to initiate game
  console.log('Started game ' + data.id);
  shuffleTiles();
  $(".grid").css("visibility", 'visible')
  $(".shuffle-button").css("visibility", 'visible')
});

socket.on('game-ended', function(data) {
  inGame = false;
  //need something for when game ends, probably jquery bullshit
  console.log('client recieved a game over msg', data);
  if ( userData.name != data.winner ) {
    console.log("this guy lost");
    document.querySelector('.dialog__text').innerHTML = 'You lost!';
    showDialog();
  }

});

socket.on('leave-queue', function() {
  //need to leave the room somehow
});

socket.on('joinSuccess', function(data) {
  console.log('data returned on room join \n', data);
  currentRoom.roomName = data.id;
  currentRoom.playerOne = data.playerOne;
  currentRoom.playerTwo = data.playerTwo;
  console.log(userData.name, 'is trying to join room', currentRoom.roomName, '(from client side)');
});

// jQuery for button functionality

$('#join-game').on('click', function() {
  console.log(userData.name, 'wants to join a room');
  socket.emit('join-game', { player: userData });
});

$('#leave-queue').on('click', function() {
  console.log(userData.name, 'left the queue');
  console.log("current room:", currentRoom);
  socket.emit('leaveQueue', currentRoom.roomName);
});