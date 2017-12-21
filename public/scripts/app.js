var socket = io.connect('http://localhost:8080')


// Constants
var inQueue = false;
var userData = {
  id: '',
  name: ''
}
var currentRoom = {
  roomName: '',
  playerOne: '',
  playerOneId: '',
  playerTwo: '',
  playerTwoId: ''
}

//Gets the data for the current user from the database
$.ajax({
  method: "GET",
  url: "api/user_data"
  }).done((user) => {
    if (user.data) {
      userData.id = user.data.id;
      userData.name = user.data.name;
    }
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

var dialog = document.querySelector('.dialog');

var orders = [
  'abcdefghijklm',
  'fmgdbalkjihec', //remove later
  'ecdibmhfajkgl',
  'ilckfgdebhjam'
];

var didWin = true;
var orderIndex = 0;

pckry.items.forEach( function( item ) {
  var attr = item.element.getAttribute('data-tile');
  mappedItems[ attr ] = item;
});

/*
 * Shuffles the tiles in the game area
 */
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

/*
 * Loads the dialog box
 */
function showDialog() {
  dialog.classList.remove('is-waiting');
}

/*
 * Implements logic for the first user to finish the puzzle
 */
function win() {
  if ( didWin ) {
    document.querySelector('.dialog__text').innerHTML = 'Nice work!';
    if (currentRoom.playerOneId === userData.id) {
      var results = {
        winner: currentRoom.playerOneId,
        loser: currentRoom.playerTwoId
      }
    } else {
      var results = {
        winner: currentRoom.playerTwoId,
        loser: currentRoom.playerOneId
      }
    }
    // Informs the server that the puzzle is complete
    socket.emit('game-over', {
      room: currentRoom,
      msg: 'Game Over!',
      winner: userData.name,
    });
    // Saves the game result to database
    $.ajax ({
      url: '/api/game-log',
      method: 'POST',
      data: results,
      success: function () {
        console.log('Result saved to database');
      }
    });

  }
  showDialog();
}


/*
 * Checks when a div is moved if the puzzle is correctly conpleted
 * If yes, loads the win function
 *
 */
pckry.on( 'dragItemPositioned', function() {
  var order = pckry.items.map( function( item ) {
    return item.element.getAttribute('data-tile');
  }).join('');
  if ( pckry.maxY === 500 && order === 'fmgdbalkjihce' ) {
    win();
  }
});

// Socket.io logic

socket.on('connection', function() {
  console.log('Client connected to socket');
});

/*
 * When the client recieves a start game notification from the socket
 * loads the game with jQuery
 */
socket.on('start-game', function(data) {
  inGame = true;
  console.log('Started game ' + data.id);
  $(".game").css("display", "block");
  $(".non-game").css("display", "none");
  shuffleTiles();
});

/*
 * When the client recieves a notification that a user has finished
 * Checks if the winning player was the current user
 * if not, loads the dialog popup and tells the player they have lost.
 */
socket.on('game-ended', function(data) {
  inGame = false;
  console.log('client recieved a game over msg', data);
  if ( userData.name != data.winner ) {
    console.log("this guy lost");
    document.querySelector('.dialog__text').innerHTML = 'You lost!';
    showDialog();
    didWin = false;
  }

});

/*
 * Sets game local variables when a game is joined
 */
socket.on('joinSuccess', function(data) {
  console.log('data returned on room join \n', data);
  currentRoom.roomName = data.id;
  currentRoom.playerOne = data.playerOne;
  currentRoom.playerOneId = data.playerOneId;
  currentRoom.playerTwo = data.playerTwo;
  currentRoom.playerTwoId = data.playerTwoId;
  console.log(userData.name, 'is trying to join room', currentRoom.roomName, '(from client side)');
});

/*
 * When an open game is created, adds to the list of available games
 *
 */
socket.on('gameCreated', function(data){
  currentRoom.playerOne = data.playerOne;
  $('.games-opened').append(`<div data=${data.id} class="games-homepage"><p>Game created by ${data.playerOne}<p><button class="join-game-button" data=${data.id}>Join</button></div>`);
    $(document).find('.join-game-button').on('click', function(){
      socket.emit( 'join-game-button', {id: data.id, user: userData});
    });
});

/*
 * When a game is either cancelled or filled
 * removes the game from the available games list
 */
socket.on('game-filled', function(data){
  console.log("heard that the game is filled" , data);
  $(document).find(`[data=${data}]`).css('display', 'none');
});


// jQuery for button functionality

$('.shuffle-button').on('click', function() {
  shuffleTiles();
});

$('#make-game').on('click', function() {
  if (inQueue) {
    console.log("Already in Queue");
    return;
  }
  console.log(userData.name, 'wants to join a room');
  socket.emit('make-game', { player: userData });
  inQueue = true;

});

$('#join-game').on('click', function() {
  if (inQueue) {
    console.log("Already in Queue");
    return;
  }
  console.log(userData.name, 'wants to join a room');
  socket.emit('join-game', { player: userData });
  inQueue = true;

});

$('#leave-queue').on('click', function() {
  console.log(userData.name, 'left the queue');
  socket.emit('leaveQueue', currentRoom.roomName);
  currentRoom.roomName = "";
  currentRoom.playerOne = "";
  currentRoom.playerOneId = "";
  console.log("current room:", currentRoom);
  inQueue = false;
});

$('.close-dialog-button').on('click', function(){
  $('.dialog').addClass('is-waiting');
});