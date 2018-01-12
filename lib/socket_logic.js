const newId = require('uuid/v1');


exports = module.exports = function(io){

  // creating places to store the games
  const gameCollection = [];

  /*
   * Creates a new game
   *
   * @param socket - user's socket
   * @param {object} player - info for the creating user
   */
  function buildGame(socket) {
    // Creates a new game object, adds it to gameCollection
    let gameObject = {};
    gameObject.id = newId();
    gameObject.pictureId = Math.ceil(Math.random() * 41);
    gameObject.playerOne = socket.user_name;
    gameObject.playerOneId = socket.user_id;
    gameObject.playerTwo = '';
    gameObject.playerTwoId = '';
    gameCollection.push(gameObject);

    // Emits to clients that the game has been made
    socket.emit('join-success', gameObject);
    // Joins room for the new game
    socket.join(gameObject.id);
    io.emit('all-games', availableGames(gameCollection));
  }

  /*
   * Searches for an available game,
   * If none found makes a new game
   *
   * @param socket - user's socket
   * @param {object} player - info for the searching user
   */
  function gameSeeker(socket) {
    // If no games exist, create one
    if (gameCollection.length === 0) {
      buildGame(socket);
      return;
    }
    // Searches through the gameCollection for a game w/o a second player
    for(const game of gameCollection) {
      if(!game.playerTwo) {
        if(game.playerOneId === socket.user_id) {
          // Needs to return error that user is already in the queue
          return;
        }
        // Updates the game info with user info
        game.playerTwo = socket.user_name;
        game.playerTwoId = socket.user_id;
        // Joins the room
        socket.join(game.id);
        flagUsersInGame(game.id);
        // Emits notification that the game is filled, starts the game
        io.sockets.in(game.id).emit('join-success', game);
        io.sockets.in(game.id).emit('start-game', game);
        io.emit('all-games', availableGames(gameCollection));
        io.emit('list-players', listOnlinePlayers(io.sockets));
        return;
      }
    }
    // If no games exist w/o a player 2, create a new game
    buildGame(socket);
  }

  /*
   * Creates a flag on a socket that a game has started
   * Used to create the Playing flag on client side
   */
  function flagUsersInGame(roomId){
    let users_in_room = io.sockets.adapter.rooms[roomId].sockets;

    for (const userId in users_in_room){
      io.sockets.sockets[userId].in_game = true;
    }
  }

  /*
   * Join a specific game
   *
   * @param socket - user's socket
   * @param {object} data - info for the user and game
   */
  function joinGame(socket, data){
    if(socket.user_name){
      for(const game of gameCollection){
        if ((game.id === data.id) && (game.playerOneId !== data.user.id) && !game.playerTwoId){
          // Updates game info
          game.playerTwo = socket.user_name;
          game.playerTwoId = socket.user_id;
          // Joins Room
          socket.join(game.id);
          // Emits notification that game is filled, starts game
          io.sockets.in(game.id).emit('join-success', game);
          io.sockets.in(game.id).emit('start-game', game);
          flagUsersInGame(game.id);
          pruneOpenGames(socket, game.playerOneId);
          pruneOpenGames(socket, game.playerTwoId);
          io.emit('all-games', availableGames(gameCollection));
          io.emit('list-players', listOnlinePlayers(io.sockets));
          return;
        }
      }
    }
    else {
      socket.emit('refresh-page', 'An error occurred');
    }
  }

  /*
   * Removes any open games of a given user
   *
   * @param socket - users socket
   * @param userId - user id
   */
  function pruneOpenGames(socket, userId) {
    for (let i = 0; i < gameCollection.length; i++) {
      if(!gameCollection[i].playerTwoId){
        if(gameCollection[i].playerOneId === userId) {
          socket.leave(gameCollection[i].id);
          gameCollection.splice(i, 1);
        }
      }
    }
  }

  /*
   * When a user choses to leave the queue deletes their game
   *
   * @param socket - user's socket
   * @param {string} gameId - id of the game
   */
  function leaveQueue(socket, gameId) {
    // Searches through the gameCollection for a specific game
    for (let i = 0; i < gameCollection.length; i++) {
      if (gameCollection[i].id === gameId) {
        // Remove game object from gameCollection
        gameCollection.splice(i, 1);
        // Leave the Room
        socket.leave(gameId);
        // Emit notification that game is no longer available
        io.emit('all-games', availableGames(gameCollection));
      }
    }
  }

  /*
   * Will return an array of games that have 1 player.
   */
  function availableGames(allGames) {
    let openGames = [];
    for(let i = 0; i < allGames.length; i++) {
      if (!allGames[i].playerTwo) {
        openGames.push(allGames[i]);
      }
    }
    return openGames;
  }

  // Creates an array of all online players
  function listOnlinePlayers(allSockets) {
    playerList = [];
    for (let socket in allSockets.sockets) {
      if(allSockets.sockets[socket].user_name) {
        playerList.push({
          userName: allSockets.sockets[socket].user_name,
          userId: allSockets.sockets[socket].user_id,
          wins: allSockets.sockets[socket].user_wins,
          inGame: allSockets.sockets[socket].in_game
        });
      }
    }
    return playerList;
  }

 // On socket connection recieving info from the client side

  io.on('connection', function(socket) {

    socket.on('new-user', function(data) {
      socket.user_id = data.id;
      socket.user_name = data.name;
      socket.user_wins = data.wins;
      socket.in_game = false;

      // Need to re-add to open games already created
      for (let i = 0; i < gameCollection.length; i++) {
        if((gameCollection[i].playerOneId === socket.user_id) && !gameCollection[i].playerTwoId) {
          socket.join(gameCollection[i].id);
          socket.emit('existing-game', gameCollection[i].id);
        }
      }

      const allOpenGames = availableGames(gameCollection);
      io.emit('list-players', listOnlinePlayers(io.sockets));
      io.emit('all-games', allOpenGames);
    });

    socket.on('join-queue', function(data) {
      if(socket.user_name){
        gameSeeker(socket);
      }
      else {
        socket.emit('refresh-page', 'An error occurred');
      }
    });

    socket.on('join-game', function(data){
      joinGame(socket, data);
    });

    socket.on('make-game', function(data){
      if(socket.user_name){
        buildGame(socket);
      }
      else {
        socket.emit('refresh-page', 'An error occurred');
      }
    });

    socket.on('game-over', function(data) {
      io.sockets.in(data.room.roomName).emit('game-ended', data);
      io.emit('refresh-leaderboard', 'refresh leaderboard');
    });

    socket.on('playing-solo', function(data) {
      pruneOpenGames(socket, data.id);
      socket.in_game = true;
      io.emit('list-players', listOnlinePlayers(io.sockets));
    });

    socket.on('leave-queue', function(data){
      for (let i = 0; i < gameCollection.length; i++) {
        if(gameCollection[i].playerOneId === socket.user_id) {
          gameCollection.splice(i, 1);
        }
        else if (gameCollection[i].playerTwoId && gameCollection[i].playerTwoId === socket.user_id) {
          gameCollection.splice(i, 1);
        }
        io.emit('all-games', availableGames(gameCollection));
      }
    });

    socket.on('leaving-page', function() {
      io.emit('user-gone-offline', socket.user_id);
      // remove all of the users open games in games collection
      for (let i = 0; i < gameCollection.length; i++) {
        if(gameCollection[i].playerOneId === socket.user_id) {
          socket.leave(gameCollection[i].id);
          gameCollection.splice(i, 1);
        }
        else if (gameCollection[i].playerTwoId && gameCollection[i].playerTwoId === socket.user_id) {
          socket.leave(gameCollection[i].id);
          gameCollection.splice(i, 1);
        }
        io.emit('all-games', availableGames(gameCollection));
      }
    });

    socket.on('disconnect', function() {
      io.emit('user-gone-offline', socket.user_id);
      //remove all of the users open games in games collection
      for (let i = 0; i < gameCollection.length; i++) {
          if(gameCollection[i].playerOneId == socket.user_id) {
          socket.leave(gameCollection[i].id);
          gameCollection.splice(i, 1);
        } else if (gameCollection[i].playerTwoId && gameCollection[i].playerTwoId == socket.user_id) {
          socket.leave(gameCollection[i].id);
          gameCollection.splice(i, 1);
        }
        io.emit('all-games', availableGames(gameCollection));
        io.emit('list-players', listOnlinePlayers(io.sockets));
      }
    });

  });
}

