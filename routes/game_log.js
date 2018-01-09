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

  // Saves the Results of a Game
  router.post('/', (req, res) => {
    saveGameResult(req.body).then(() => {
      return;
    });
  });

  return router;
};

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