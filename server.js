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

app.post('/api/game-log', (req, res) => {
  console.log('input to game log post', req.body);
  saveGameResult(req.body).then(() => {
    console.log('results saved');
    return;
  });
});

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

function buildGame(socket, player) {
  let gameObject = {};
  gameObject.id = newId();
  //hard coded for now
  gameObject.playerOne = player.name;
  gameObject.playerOneId = player.id;
  gameObject.playerTwo = null;
  gameObject.playerTwoId = 0;
  gameCollection.push(gameObject);

  console.log("Game created by " + gameObject.playerOne + " w/ " + gameObject.id);

  socket.emit('joinSuccess', gameObject);
  socket.join(gameObject.id);
}


function gameSeeker(socket, player) {
  console.log('number of games', gameCollection.length);
  if (gameCollection.length == 0) {
    buildGame(socket, player);
    return;
  }
  //hard coded for now
  for(let i = 0; i < gameCollection.length; i++) {
    if(!gameCollection[i].playerTwo) {
      console.log('FOUND A GAME');
      let gameId = gameCollection[i].id;
      gameCollection[i].playerTwo = player.name;
      gameCollection[i].playerTwoId = player.id;
      socket.join(gameId);
      console.log("gameId:", gameId);
      console.log( 'Mark' + " has been added to: " + gameCollection[i].id);
      io.sockets.in(gameId).emit('joinSuccess', gameCollection[i]);
      io.sockets.in(gameId).emit('start-game', gameCollection[i]);
      return;
    }
  }
  buildGame(socket, player);
}

function leaveQueue(socket, gameId) {
  //get game Id
  for (let i = 0; i < gameCollection.length; i++) {
    if (gameCollection[i].id === gameId) {
      console.log(gameCollection);
      console.log("gameCollection[i].id:", gameCollection[i].id);
      gameCollection.splice(i, 1);
      socket.leave(gameId);
    }
  }
}

//on socket connection sending info to the client side

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

