require('dotenv').config({path: './.env'});

const PORT = process.env.PORT || 8080;
const ENV = process.env.ENV || 'development';
const cookieSession = require('cookie-session');

const express = require('express');
const bodyParser = require('body-parser');
const sass = require('node-sass-middleware');
const app = express();
const path = require('path');
const flash = require('connect-flash');

const knexConfig = require('./knexfile');
const knex = require('knex')(knexConfig[ENV]);
const morgan = require('morgan');
const knexLogger = require('knex-logger');
const server = require('http').Server(app);
const io = require('socket.io')(server);
const newId = require('uuid/v1');

// Seperated Routes for each Resource
const profileRoutes = require('./routes/profile');
const gameRoutes = require('./routes/game');
const loginRoutes = require('./routes/login');
const registerRoutes = require('./routes/register');
const logoutRoutes = require('./routes/logout');

server.listen(PORT);

app.set('view engine', 'ejs');
app.use(morgan('dev'));

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(knexLogger(knex));
app.use(bodyParser.urlencoded({extended: true}));

app.use(sass({
 src: "./styles",
 dest:  "./public/styles",
 indentedSyntax: false,
 force: true,
 debug: true,
 outputStyle: 'expanded'
}));

// Sets the secure cookie session
app.use(cookieSession({
  name: 'session',
  keys: ['Cleo'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.use(flash());

// Mount all resource routes
app.use('/profile', profileRoutes(knex));
app.use('/game', gameRoutes(knex));
app.use('/login', loginRoutes(knex));
app.use('/register', registerRoutes(knex));
app.use('/logout', logoutRoutes(knex));


app.get('/', (req, res) => {

  const templateVars = {
    user: req.session.user_id
  };
  res.render('index', templateVars);
});


// Returns userdata for logged in user
app.get('/api/user_data', (req, res) => {

  if (!req.session) {
    // The user is not logged in
    console.log('not logged in');
    res.json({});
  } else {
    console.log(req.session.user_id, 'is logged in');
    getUserInfo(req.session.user_id).then((data) => {
      return res.json({data});

    });
  }
});

// Saves the results of a game
app.post('/api/game-log', (req, res) => {
  console.log('input to game log post', req.body);
  saveGameResult(req.body).then(() => {
    console.log('results saved');
    return;
  });
});

/*
 * saves game result to database
 *
 * @param {object} result - results of game
 */
function saveGameResult(result) {
  return knex('games')
    .insert({
      winner: result.winner,
      loser: result.loser
    })
    .then(() => {
      return;
    });
}

/*
 * retrieves userdata from database
 *
 * @param {number} id - user id
 * @return {object} - user data
 */
function getUserInfo(id) {
  return knex
    .select('name', 'id')
    .from('users')
    .where('id', id)
    .then((user) => {
      userInfo = user[0];
      return userInfo;
    });
}

//creating a place to store the games
const gameCollection = [];

/*
 * Creates a new game
 *
 * @param socket - user's socket
 * @param {object} player - info for the creating user
 */
function buildGame(socket, player) {
  // Creates a new game object, adds it to gameCollection
  let gameObject = {};
  gameObject.id = newId();
  console.log('player info in the build game function', player);
  gameObject.playerOne = player.name;
  gameObject.playerOneId = player.id;
  gameObject.playerTwo = null;
  gameObject.playerTwoId = 0;
  console.log('game created in the build game function', gameObject);
  gameCollection.push(gameObject);

  console.log("Game created by " + gameObject.playerOne + " w/ " + gameObject.id);
  // Emits to clients that the game has been made
  io.emit("gameCreated", gameObject);
  socket.emit('joinSuccess', gameObject);
  // Joins room for the new game
  socket.join(gameObject.id);
}

/*
 * Searches for an available game,
 * If none found makes a new game
 *
 * @param socket - user's socket
 * @param {object} player - info for the searching user
 */
function gameSeeker(socket, player) {
  // If no games exist, create one
  if (gameCollection.length == 0) {
    buildGame(socket, player);
    return;
  }
  // Searches through the gameCollection for a game w/o a second player
  for(let game of gameCollection) {
    if(!game.playerTwo) {
      console.log('FOUND A GAME');
      // Updates the game info with user info
      game.playerTwo = player.name;
      game.playerTwoId = player.id;
      // Joins the room
      socket.join(game.id);
      console.log("game.id:", game.id);
      console.log( player.name + " has been added to: " + game.id);
      // Emits notification that the game is filled, starts the game
      io.sockets.in(game.id).emit('joinSuccess', game);
      io.sockets.in(game.id).emit('start-game', game);
      io.emit('game-filled', game.id);
      return;
    }
  }
  // If no games exist w/o a player 2, create a new game
  buildGame(socket, player);
}

/*
 * Join a specific game
 *
 * @param socket - user's socket
 * @param {object} data - info for the user and game
 */
function joinGame(socket, data){
  for( let game of gameCollection){
    if (game.id === data.id){
      // Updates game info
      game.playerTwo = data.user.name;
      game.playerTwoId = data.user.id;
      console.log(game , " this is game inside the function");
      // Joins Room
      socket.join(game.id);

      console.log( data.user.name + " has been added to: " + game.id);
      // Emits notification that game is filled, starts game
      io.sockets.in(game.id).emit('joinSuccess', game);
      io.sockets.in(game.id).emit('start-game', game);
      io.emit('game-filled', game.id);
     return;
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
      console.log(gameCollection);
      console.log("gameCollection[i].id:", gameCollection[i].id);
      // Remove game object from gameCollection
      gameCollection.splice(i, 1);
      // Leave the Room
      socket.leave(gameId);
      // Emit notification that game is no longer available
      io.emit('game-filled', gameId);
    }
  }
}

//on socket connection recieving info from the client side

io.on('connection', function(socket) {
  socket.emit('connection', 'socket connected');
  console.log('a socket has connected');

  socket.on('join-game', function(data) {
    console.log('server heard a game request');
    console.log('join game', data.player.name);
    let room = { id: newId() };
    gameSeeker(socket, data.player);
    console.log(io.sockets.adapter.rooms);
  });

  socket.on('join-game-button', function(data){
      joinGame(socket, data);
      console.log(data, " game request Id");
  });

  socket.on('make-game', function(data){
    console.log(data.player, "this is from the make game listener");
    buildGame(socket, data.player);
  });

  socket.on('game-over', function(data) {
    console.log('Game over, someone won');
    console.log('incoming gameover data', data);
    console.log('Ended game id', data.room.roomName);
    io.sockets.in(data.room.roomName).emit('game-ended', data);
  });

  socket.on('leaveQueue', function(data){
    console.log("left queue");
    console.log("data: ", data)
    console.log("gameCollection before", gameCollection);
    leaveQueue(socket, data);
    console.log("gameCollection after", gameCollection);
  });

});

