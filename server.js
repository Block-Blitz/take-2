require('dotenv').config();

const PORT        = process.env.PORT || 8080;
const ENV         = process.env.ENV || 'development';
const cookieSession = require('cookie-session');
const express     = require('express');
const bodyParser  = require('body-parser');
const sass        = require('node-sass-middleware');
const app         = express();
const bcrypt      = require('bcrypt');
const path        = require('path');
const flash       = require('connect-flash');

const knexConfig  = require('./knexfile');
const knex        = require('knex')(knexConfig[ENV]);
const morgan      = require('morgan');
const knexLogger  = require('knex-logger');
const server      = require('http').Server(app);
const io          = require('socket.io')(server);
const newId       = require('uuid/v1');

// Seperated Routes for each Resource
 const profileRoutes = require("./routes/profile");
 const gameRoutes = require("./routes/game");
 const loginRoutes = require("./routes/login");
 const registerRoutes = require("./routes/register");
// const contributionsRoutes = require("./routes/contributions");
// const currentMapMarkers = require("./routes/current-map-markers");

server.listen(PORT);

app.set('view engine', 'ejs');
app.use(morgan('dev'));

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(knexLogger(knex));
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/styles', sass({
  src: __dirname + '/styles',
  dest: __dirname + '/public/styles',
  debug: true,
  outputStyle: 'compressed'
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
 app.use("/profile", profileRoutes(knex));
 app.use("/game", gameRoutes(knex));
 app.use("/login", loginRoutes(knex));
 app.use("/register", registerRoutes(knex));
// app.use("/api/new-favourite", newFavoriteRoutes(knex));
// app.use("/api/current-map-markers", currentMapMarkers(knex));



app.get("/", (req, res) => {

  res.render("index");
});

//creating a place to store the games

let gameCollection = {

  gameList: []

};

function buildGame(socket) {
  let gameObject = {};
  gameObject.id = newId();
  //hard coded for now
  gameObject.playerOne = 'Catherine';
  gameObject.playerTwo = null;
  gameCollection.gameList.push({gameObject});

  console.log("Game created by " + gameObject.playerOne + " w/ " + gameObject.id);

  socket.join(gameObject.id);
}

//on socket connection sending info to the client side

io.on('connection', function(socket) {
  socket.emit('connection', 'socket connected');
  console.log('a socket has connected');

  socket.on('join-game', function(msg) {
    console.log('server heard a game request');
    //let room = { id: newId() };
    //console.log(room);
    // socket.join(room.id);
    buildGame(socket);
    console.log(io.sockets.adapter.rooms);
    //io.to(room).emit('room-invite', room );
    // create room, send room ID to client
  });


});



