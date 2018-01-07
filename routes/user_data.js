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

  // Gets the user data for logged in user
  router.get('/', (req, res) => {
     if (!req.session.user_id) {
    // The user is not logged in
    console.log('not logged in');
    res.json({});
    } else {
      console.log(req.session.user_id, 'is logged in');
      let userInfo = {};
      getUserInfo(req.session.user_id).then((data) => {
        userInfo.id = data.id;
        userInfo.name = data.name;
        userInfo.wins = data.wins;
        if(!data.wins) {
          userInfo.wins = 0;
        }
        console.log('user info in callback', userInfo);
        return;
      }).then(() => {
        calculateLosses(req.session.user_id).then((data) => {
          console.log('this is losses', data);
          userInfo.losses = data;
          if (!data) {
            userInfo.losses = 0;
          }
          console.log('user data immediately before sending', userInfo);
          return res.json(userInfo);
        });
      });
    }
  });


  return router;
};

/*
 * retrieves user name and win total from database
 *
 * @param {number} id - user id
 * @return {object} - user data
 */
function getUserInfo(id) {
  return knex
    .select('users.name', 'users.id')
    .count('winner as wins')
    .from('users')
    .leftJoin('games', 'users.id', 'games.winner')
    .where('users.id', id)
    .groupBy('users.id')
    .then((user) => {
      userInfo = user[0];
      return userInfo;
    });
}

/*
 * retrieves user lose total from database
 *
 * @param {number} id - user id
 * @return {object} - user data
 */
function calculateLosses(id) {
  return knex('games')
  .count('loser')
  .where('loser', id)
  .then((losses) =>{
    return losses[0].count;
  });
}