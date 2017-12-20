require('dotenv').config();

const ENV = process.env.ENV || 'development';
const knexConfig = require('../knexfile');
const knex = require('knex')(knexConfig[ENV]);
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');

// Check if email is already in db before login/register
function checkEmailInDB(email) {
  return knex
    .select('email')
    .from('users')
    .where({'email': email})
    .then((users) => {
      return users.length !== 0;
    });
}

function checkNameInDB(name) {
  return knex
    .select('name')
    .from('users')
    .where({'name': name})
    .then((users) => {
      return users.length !== 0;
    });
}


function facebookCheckEmailInDB(email) {
  return knex
   .select('email')
    .from('users')
    .where({'email': email})
    .then((users) => {
      return users.length !== 0;
    });
}

function facebookRegisterUser(name, email) {
  let user_id = 0;
  return knex('users')
    .insert({
      name: name,
      email: email
    })
    .returning('*')
    .then((users) => {
      user_id = users[0].id;
      return user_id;
    });
}

// Register new urser
function registerUser(name, email, password) {
  let user_id = 0;
  return knex('users')
    .insert({
      name: name,
      email: email,
      password: password
    })
    .returning('*')
    .then((users) => {
      user_id = users[0].id;
      return user_id;
    });
}


// Verifies email and password match
function checkLogin(email, password) {
  return knex('users')
    .where({email: email})
    .returning('*')
    .then((result) => {
      if (bcrypt.compareSync(password, result[0].password)) {
        return result[0].id;
      }
      else {
        return 0;
      }
    });
}

module.exports = {
  registerUser,
  checkEmailInDB,
  checkLogin,
  facebookRegisterUser,
  facebookCheckEmailInDB,
  checkNameInDB
};
