// Constains all the constants and functinons needed for App.js

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

