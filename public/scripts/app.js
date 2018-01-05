var socket = io.connect('http://localhost:8080');


// Constants
var inQueue = false;
var userData = {
  id: '',
  name: '',
  wins: 0
};
var currentRoom = {
  roomName: '',
  playerOne: '',
  playerOneId: '',
  playerTwo: '',
  playerTwoId: '',
  pictureId: 1
};

//Gets the data for the current user from the database
$.ajax({
  method: "GET",
  url: "api/user_data"
  }).done((user) => {
    console.log('user data', user);
    if (user.name) {
      userData.id = user.id;
      userData.name = user.name;
      userData.wins = user.wins;
      socket.emit('new-user', userData);
    }
  });


/*
 * Implements logic for the first user to finish the puzzle here instead of puzzle.js because it contains player variables
 */
function win() {
  if ( didWin ) {
    document.querySelector('.dialog__text').innerHTML = 'Nice work, you won!';

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
  // if(userData.name) {
  //   socket.emit('new-user', userData);
  // }
});

/*
 * When the client recieves a start game notification from the socket
 * loads the game with jQuery
 */
socket.on('start-game', function(data) {
  inGame = true;
  console.log('Started game ' + data.pictureId);
  console.log('currentRoom.pictureId:', currentRoom.pictureId);
  setPicture(currentRoom);
  $(".game").css("display", "block");
  $(".non-game").css("display", "none");
  randomLayout();
  $(".versus").append(`<span class="fight"> ${currentRoom.playerOne} <span class="em">VS</span> ${currentRoom.playerTwo}`);

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
    document.querySelector('.dialog__text').innerHTML = 'You lost! '+ data.winner + ' was the winner.';
    showDialog();
    didWin = false;
  }

});

/*
 * Sets game local variables when a game is joined
 */
socket.on('join-success', function(data) {
  console.log('data returned on room join \n', data);
  currentRoom.roomName = data.id;
  currentRoom.playerOne = data.playerOne;
  currentRoom.playerOneId = data.playerOneId;
  currentRoom.playerTwo = data.playerTwo;
  currentRoom.playerTwoId = data.playerTwoId;
  currentRoom.pictureId = data.pictureId;
  console.log(userData.name, 'is trying to join room', currentRoom.roomName, '(from client side)');

});



//lists all open games

socket.on('all-games', function(data) {
  //destroy old list
  $('.open-games').remove();
  //create new div
  $('.games-opened').append('<div class="open-games"></div>');
  //populate new div
  console.log('all available games', data);
  for (let game of data) {
    console.log('game object', game);
    $('.open-games').append(`<div data=${game.id} class="available-game"><p>Game available against ${game.playerOne}</p><button class="button button-small join-game-button" data=${game.id}>Join</button></div>`);
      $(document).find('.join-game-button').on('click', function(){
        socket.emit( 'join-game', {id: game.id, user: userData});
    });
  }
});



socket.on('user-gone-offline', function(id) {
  if(id){
    let idString = id.toString();
    console.log(typeof idString);
    console.log('looking to remove the id:', id);
    $(document).find(`.player-${id}`).remove(`.player-${id}`);
  }
});


// Announces that user is going offline, removes them from the
// active player list and removes their active games if any
$(window).on("unload", function(e) {
  //works on closing window, not refresh
  console.log('leaving page');
    socket.emit('leaving-page', 'user leaving page');
});

//creatss a list of all online players
socket.on('list-players', function(arrayOfPlayers) {
  //destroy existing player list
  $('.player-list').remove();
  //create a player-list div
  $('.online-players').append('<div class="player-list"></div');
  //cycle through array and make list
  for (let player of arrayOfPlayers) {
    console.log('each player', player);
    $('.player-list').append(`<div class="player player-${player.userId}"><span class="player-name">${player.userName}, total wins ${player.wins}</span></div>`);
    if (player.inGame){
      $(`.player-${player.userId}`).prepend('<span class="ingame"> Currently in a game!  </span>');
      $('.ingame').parent(`.player-${player.userId}`).css("font-style", "italic").css("text-transform", "uppercase");
      $('.player-name').css('position', 'relative').css('left', '-11%');
    }
  }

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

$('#join-queue').on('click', function() {
  if (inQueue) {
    console.log("Already in Queue");
    return;
  }
  console.log(userData.name, 'wants to join a room');
  socket.emit('join-queue', { player: userData });
  inQueue = true;
  displayButtonsJoinQueue();

});

$('#leave-queue').on('click', function() {
  console.log(userData.name, 'left the queue');
  socket.emit('leave-queue', currentRoom.roomName);
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
  currentRoom.pictureId = Math.ceil(Math.random() * 5);
  console.log('loading picture', currentRoom.pictureId);
  if ($(window).width() <= 500) {
    $('.tile').css("background-image", `url('public/images/cat${currentRoom.pictureId}-sm.jpg')`);
  } else {
    $('.tile').css("background-image", `url('public/images/cat${currentRoom.pictureId}-lrg.jpg')`);
  }
  $(".game").css("display", "block");
  $(".non-game").css("display", "none");
  randomLayout();
});


// Toggles Button visibilty depending on if user is in game queue or not

function displayButtonsJoinQueue() {
  $("#leave-queue").removeClass('no-display');
  $("#make-game").addClass('no-display');
  $("#join-queue").addClass('no-display');
  $("#play-solo").addClass('no-display');
}

function displayButtonsDefault() {
  $("#make-game").removeClass('no-display');
  $("#join-queue").removeClass('no-display');
  $("#play-solo").removeClass('no-display');
  $("#leave-queue").addClass('no-display');
}

//setting puzzle image

function setPicture(currentRoom) {
  if ($(window).width() <= 500) {
    $('.tile').css("background-image", `url('public/images/cat${currentRoom.pictureId}-sm.jpg')`);
  } else {
    $('.tile').css("background-image", `url('public/images/cat${currentRoom.pictureId}-lrg.jpg')`);
  }
}

$(window).resize(setPicture(currentRoom));

