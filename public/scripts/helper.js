// Contains all the constants and functinons needed for App.js

// Constants
var inQueue = false;
var userData = {
  id: '',
  name: '',
  wins: 0,
  losses: 0
};
var currentRoom = {
  roomName: '',
  playerOne: '',
  playerOneId: '',
  playerTwo: '',
  playerTwoId: '',
  pictureId: 1
};

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

//Generate user stat table

function showUserStats(userData) {
  let totalGames = parseInt(userData.wins) + parseInt(userData.losses);
  let winningPercentage = Math.round(userData.wins / totalGames *100);
  $('.user-stats').append(`<h2>${userData.name}'s Career Stats</h2>`);
  $('.user-stats').append(`<div class="wins">Wins ${userData.wins}</div>`);
  $('.user-stats').append(`<div class="losses">Losses ${userData.losses}</div>`);
  if(winningPercentage) {
    $('.user-stats').append(`<div class="winning-percentage">WP ${winningPercentage}%</div>`);
  }
  $('.user-stats').append(`<div class="total-games">Total Games Played ${totalGames}</div>`);
}

// Sets the picture and loads the game board
function startGame(data) {
  console.log('Started game ' + data.pictureId);
  console.log('currentRoom.pictureId:', currentRoom.pictureId);
  setPicture(currentRoom);
  $(".game").css("display", "block");
  $(".non-game").css("display", "none");
  randomLayout();
  $(".versus").append(`<span class="fight"> ${currentRoom.playerOne} <span class="em">VS</span> ${currentRoom.playerTwo}`);
}

// If user didn't win, displays winners name
function gameOver(data) {
  console.log('client recieved a game over msg', data);
  if ( userData.name != data.winner ) {
    console.log("this guy lost");
    document.querySelector('.dialog__text').innerHTML = 'You lost! '+ data.winner + ' was the winner.';
    showDialog();
    didWin = false;
  }
}

// Sets local variables when a game is joined
function joinGame(data) {
  console.log('data returned on room join \n', data);
  currentRoom.roomName = data.id;
  currentRoom.playerOne = data.playerOne;
  currentRoom.playerOneId = data.playerOneId;
  currentRoom.playerTwo = data.playerTwo;
  currentRoom.playerTwoId = data.playerTwoId;
  currentRoom.pictureId = data.pictureId;
  console.log(userData.name, 'is trying to join room', currentRoom.roomName, '(from client side)');
}

// Creates list of available games
function createGameList(data) {
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
}

// Creates a list of online players
function createUserList(arrayOfPlayers) {
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
}

// Removes a player from the online user list
function removeFromUserList(id) {
    if(id){
    console.log('looking to remove the id:', id);
    $(document).find(`.player-${id}`).remove(`.player-${id}`);
  }
}

// Stores user stats in local variable
function storeUserData(user) {
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
  }
}