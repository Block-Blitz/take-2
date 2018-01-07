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

const socketsio = require('./lib/socket_logic')(io);

// Seperated Routes for each Resource
const profileRoutes = require('./routes/profile');
const loginRoutes = require('./routes/login');
const registerRoutes = require('./routes/register');
const logoutRoutes = require('./routes/logout');
const privacyRoutes = require('./routes/privacy');
const userDataRoutes = require('./routes/user_data');
const gameLogRoutes = require('./routes/game_log');
const leaderboardRoutes = require('./routes/leaderboard');

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
app.use('/login', loginRoutes(knex));
app.use('/register', registerRoutes(knex));
app.use('/logout', logoutRoutes(knex));
app.use('/privacy', privacyRoutes(knex));
app.use('/api/user_data', userDataRoutes(knex));
app.use('/api/game-log', gameLogRoutes(knex));
app.use('/api/leaderboard', leaderboardRoutes(knex));


app.get('/', (req, res) => {

  const templateVars = {
    user: req.session.user_id
  };
  res.render('index', templateVars);
});



