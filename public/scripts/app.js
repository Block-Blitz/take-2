var socket = io.connect('http://localhost:8080');

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
      userData.losses = user.losses;
      if(!user.wins){
        userData.wins = 0;
      }
      if(!user.losses){
        userData.losses = 0;
      }
      socket.emit('new-user', userData);
      showUserStats(userData);
    }
});

// Socket.io logic

socket.on('connection', function() {
  console.log('Client connected to socket', userData.name);
});

/*
 * When the client recieves a start game notification from the socket
 * loads the game with jQuery
 */
socket.on('start-game', function(data) {
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
    $('.open-games').append(`<div class="available-game-container"><div class="available-game-left"><div data=${game.id} class="available-game"><p>Game available against <strong>${game.playerOne}</strong></p></div></div><div class="available-game-right"><button class="join-game-button" data=${game.id}>Join</button></div></div></div>`);
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
      $(`.player-${player.userId}`).append('<span class="ingame">In Game</span>');
    }
  }

});

socket.on('existing-game', function() {
    displayButtonsJoinQueue();
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


$('.close-dialog-button').on('click', function(){
  $('.dialog').addClass('is-waiting');
});

// When the window is resized this will set the puzzle to the correct picture
$(window).resize(setPicture(currentRoom));

