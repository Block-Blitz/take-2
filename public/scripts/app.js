var socket = io.connect('http://localhost:8080');


// Constants
var inQueue = false;
var userData = {
  id: '',
  name: ''
};
var currentRoom = {
  roomName: '',
  playerOne: '',
  playerOneId: '',
  playerTwo: '',
  playerTwoId: ''
};

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


/*
 * Implements logic for the first user to finish the puzzle here instead of puzzle.js because it contains player variables
 */
function win() {
  if ( didWin ) {
    document.querySelector('.dialog__text').innerHTML = 'Nice work!';

    if (currentRoom.playerOneId === userData.id) {
      var results = {
        winner: currentRoom.playerOneId,
        loser: currentRoom.playerTwoId
      };
    } else {
      var results = {
        winner: currentRoom.playerTwoId,
        loser: currentRoom.playerOneId
      };
    }
    // Informs the server that the puzzle is complete
    socket.emit('game-over', {
      room: currentRoom,
      msg: 'Game Over!',
      winner: userData.name,
    });
    // Saves the game result to database
    if (currentRoom.playerOneId != currentRoom.playerTwoId) {
      $.ajax ({
        url: '/api/game-log',
        method: 'POST',
        data: results,
        success: function () {
          console.log('Result saved to database');
        }
      });
    }
  }
  showDialog();
}

// Socket.io logic

socket.on('connection', function() {
  console.log('Client connected to socket', userData.name);
  if(userData.name) {
    socket.emit('new-user', userData);
  }
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

//lists online players

socket.on('all-online-users', function(data){
  console.log(data);
  data.forEach( function(user){
    $('.online-players').append(`<div class="player player-${user.id}">${user.name}</div>`);
  });
});


socket.on('new-online-user', function(data){
  console.log('new user: ', data);
  $('.online-players').append(`<div class="player player-${data.id}">${data.name}</div>`);
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

//lists all open games

socket.on('available-games', function(data) {
  console.log('all available games', data);
  for (let game of data) {
    console.log('game object', game);
    $('.games-opened').append(`<div data=${game.id} class="available-game"><p>Game available against ${game.playerOne}</p><button class="button button-small join-game-button" data=${game.id}>Join</button></div>`);
      $(document).find('.join-game-button').on('click', function(){
        socket.emit( 'join-game-button', {id: game.id, user: userData});
    });
  }
});

/*
 * When an open game is created, adds to the list of available games
 *
 */
socket.on('gameCreated', function(data){
  currentRoom.playerOne = data.playerOne;
  $('.games-opened').append(`<div data=${data.id} class="available-game"><p>Game available against ${data.playerOne}</p><button class="button button-small join-game-button" data=${data.id}>Join</button></div>`);
    $(document).find('.join-game-button').on('click', function(){
      socket.emit( 'join-game-button', {id: data.id, user: userData});
    });
});

socket.on('user-gone-offline', function(id) {
  if(id){
    let idString = id.toString();
    console.log(typeof idString);
    console.log('looking to remove the id:', id);
    $(document).find(`.player-${id}`).remove(`.player-${id}`);
  }
});

/*
 * When a game is either cancelled or filled
 * removes the game from the available games list
 */
socket.on('game-filled', function(id){
  console.log("heard that the game is filled" , id);
  $(document).find(`[data=${id}]`).remove();
});

// Announces that user is going offline, removes them from the
// active player list and removes their active games if any
$(window).on("unload", function(e) {
  //works on closing window, not refresh
  console.log('leaving page');
    socket.emit('leaving-page', 'user leaving page');
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
  displayButtonsJoinQueue();
});

$('#join-game').on('click', function() {
  if (inQueue) {
    console.log("Already in Queue");
    return;
  }
  console.log(userData.name, 'wants to join a room');
  socket.emit('join-game', { player: userData });
  inQueue = true;
  displayButtonsJoinQueue();
});

$('#leave-queue').on('click', function() {
  console.log(userData.name, 'left the queue');
  socket.emit('leaveQueue', currentRoom.roomName);
  currentRoom.roomName = "";
  currentRoom.playerOne = "";
  currentRoom.playerOneId = "";
  console.log("current room:", currentRoom);
  inQueue = false;
  displayButtonsDefault();
});

$('.close-dialog-button').on('click', function(){
  $('.dialog').addClass('is-waiting');
});

$('#play-solo').on('click', function() {
  console.log('Started a single player game');
  $(".game").css("display", "block");
  $(".non-game").css("display", "none");
  shuffleTiles();
});


// Toggles Button visibilty depending on if user is in game queue or not

function displayButtonsJoinQueue() {
  $("#leave-queue").removeClass('no-display');
  $("#make-game").addClass('no-display');
  $("#join-game").addClass('no-display');
  $("#play-solo").addClass('no-display');
}

function displayButtonsDefault() {
  $("#make-game").removeClass('no-display');
  $("#join-game").removeClass('no-display');
  $("#play-solo").removeClass('no-display');
  $("#leave-queue").addClass('no-display');
}