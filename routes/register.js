const express = require('express');
const router = express.Router();
const helpers = require('../lib/helpers.js');
const flash = require('connect-flash');
const bcrypt = require('bcrypt');
// add back knex when database is set up properly **************
module.exports = () => {

  // Gets the current signed in user.
  router.get('/', (req, res) => {
    res.render('register');
  });
  // Gets the current signed in user.
  router.post('/', (req, res) => {
    console.log('email is ! :' + req.body.email);
    console.log('name is: ' + req.body.name);
    console.log('name is: ' + req.body.password);
    const name = req.body.name;
    const email = req.body.email;
    const password = bcrypt.hashSync(req.body.password, 10);
    if (!req.body.email || !req.body.password || !req.body.name) {
      req.flash('error', 'Both email and password are required');
      console.log('hello inputs are empty');
      // res.redirect(req.get('referer'));
      return;
    }
    helpers.checkEmailInDB(email, password)
      .then(exists => {
        if (!exists) {
          return helpers.registerUser(name, email, password)
            .then(user_id => {
              req.session.user_id = user_id;
              console.log('registered');
              res.status(200).send('Test Stuff');
            });
        }
        else {
          req.flash('error', 'Email is not unique');
          console.log('Email is not unique');
          // res.redirect(req.get('referer'));
        }
      });
  });


  return router;
};
