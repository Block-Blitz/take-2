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
 * If user is first to complete the puzzle this saves
 * the game result to the DB and informs the other player
 * as well as showing the winner a gameover msg
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
          console.log('Saved result to database');
        }
      });
    }
  }
  didWin = false;
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
    $('.tile').css("background-image", `url('public/images/puzzle-pics/picture-${currentRoom.pictureId}-small.jpg')`);
  } else {
    $('.tile').css("background-image", `url('public/images/puzzle-pics/picture-${currentRoom.pictureId}-big.jpg')`);
  }
}

//Generate user stat table

function showUserStats(userData) {
  let totalGames = parseInt(userData.wins) + parseInt(userData.losses);
  let winningPercentage = Math.round(userData.wins / totalGames *100);
  $('.user-stats').append(`<h2>${userData.name}'s Totals</h2>`);
  $('.user-stats').append(`<div class="stat wins"><div>Wins</div> <div>${userData.wins}</div></div>`);
  $('.user-stats').append(`<div class="stat losses"><div>Losses</div> <div>${userData.losses}</div></div>`);
  if(winningPercentage) {
    $('.user-stats').append(`<div class="stat winning-percentage"><div>Win Ratio</div> <div>${winningPercentage}%</div></div>`);
  }
  $('.user-stats').append(`<div class="stat total-games"><div>Total Games</div> <div>${totalGames}</div></div>`);
}

// Sets the picture and loads the game board
function startGame(data) {
  setPicture(currentRoom);
  $(".game").css("display", "block");
  $(".non-game").css("display", "none");
  randomLayout();
  $(".versus").append(`<span class="fight"> ${currentRoom.playerOne} <span class="em">VS</span> ${currentRoom.playerTwo}`);
}

// If user didn't win, displays winners name
function gameOver(data) {
  if ( userData.name != data.winner ) {
    document.querySelector('.dialog__text').innerHTML = 'You lost! '+ data.winner + ' was the winner.';
    showDialog();
    didWin = false;
  }
}

// Sets local variables when a game is joined
function joinGame(data) {
  currentRoom.roomName = data.id;
  currentRoom.playerOne = data.playerOne;
  currentRoom.playerOneId = data.playerOneId;
  currentRoom.playerTwo = data.playerTwo;
  currentRoom.playerTwoId = data.playerTwoId;
  currentRoom.pictureId = data.pictureId;
}

// Creates list of available games
function createGameList(data) {
  //destroy old list
  $('.open-games').remove();
  //create new div
  $('.games-opened').append('<div class="open-games"></div>');
  //populate new div
  for (let game of data) {
     console.log("user", userData.name);
     console.log("player one:", game.playerOne)
    if (userData.name === game.playerOne) {
      $('.open-games').append(`<div class="available-game-container"><div class="available-game-left"><div data=${game.id} class="available-game"><p>Waiting for an opponent </p></div></div><div class="available-game-right"><button class="cancel-game-button" data=${game.id}>Cancel</button></div></div>`);
      $(document).find('.cancel-game-button').on('click', function(){
        socket.emit('leave-queue', currentRoom.roomName);
        currentRoom.roomName = "";
        currentRoom.playerOne = "";
        currentRoom.playerOneId = "";
        inQueue = false;
        displayButtonsDefault();
      });
    } else {
      $('.open-games').append(`<div class="available-game-container"><div class="available-game-left"><div data=${game.id} class="available-game"><p>Game available against <strong>${game.playerOne}</strong></p></div></div><div class="available-game-right"><button class="join-game-button" data=${game.id}>Join</button></div></div></div>`);
      $(document).find('.join-game-button').on('click', function(){
          socket.emit( 'join-game', {id: game.id, user: userData});
      });
    }
  }
  //Shows user that there are currently no open games
  if(!data.length) {
    $('.open-games').append('<div class="available-game-container"><div class="available-game-left"><div class="available-game"><p>Currently no open games</p></div></div><div class="available-game-right"><button class="create-game-button">Create</button></div></div>');
    $(document).find('.create-game-button').on('click', function(){
      socket.emit('make-game', { player: userData });
      inQueue = true;
      displayButtonsJoinQueue();
    });
  }
}

// Creates a list of online players
function createUserList(arrayOfPlayers) {
  //destroy existing player list
  $('.player-list').remove();
  //create a player-list div
  $('.online-players').append('<div class="player-list"></div>');
  //cycle through array and make list
  let allPlayers = [];
  for (let player of arrayOfPlayers) {
    if(!allPlayers.includes(player.userId)) {
      allPlayers.push(player.userId);
      $('.player-list').append(`<div class="player player-${player.userId}"><span class="player-name">${player.userName}</span></div>`);
      if (player.inGame){
        $(`.player-${player.userId}`).append('<span class="ingame">Playing</span>');
      } else {
        $(`.player-${player.userId}`).append(`<span> ${player.wins} wins</span>`)
      }
    }
  }
}

// Removes a player from the online user list
function removeFromUserList(id) {
  if(id){
    $(document).find(`.player-${id}`).remove(`.player-${id}`);
  }
}

// Stores user stats in local variable
function storeUserData(user) {
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
}