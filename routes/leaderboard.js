require('dotenv').config({path: './.env'});
const ENV = process.env.ENV || 'development';

const express = require('express');
const router = express.Router();
const knexConfig = require('../knexfile');
const knex = require('knex')(knexConfig[ENV]);
const morgan = require('morgan');
const knexLogger = require('knex-logger');

const helpers = require('../lib/helpers.js');

module.exports = () => {

  // Gets the user data needed to generate leaderboard
  router.get('/', (req, res) => {
    getLeaderboard().then((data) => {
      return res.json(data);
    });
  });


  return router;
};


// Gets the leaderboard data from DB
function getLeaderboard() {
  return knex
    .select('users.name', 'users.id')
    .count('winner as wins')
    .from('games')
    .innerJoin('users', 'games.winner', 'users.id')
    .groupBy('users.id')
    .orderBy('wins', 'desc')
    .limit(5)
    .then((data) => {
      return data;
    });
}
