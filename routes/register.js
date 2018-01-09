const express = require('express');
const router = express.Router();
const helpers = require('../lib/helpers.js');
const bcrypt = require('bcrypt');
const swearjar = require('swearjar');
// add back knex when database is set up properly **************
module.exports = () => {

  // Gets the current signed in user.
  router.get('/', (req, res) => {
    const templateVars = {
      errors: req.flash('error'),
      success: req.flash('success'),
      user: req.session.user_id,
      facebook_error: req.flash('facebook-error')
    };

    if (req.session.user_id){
      res.redirect('/');
    }
    else {
      res.render('register', templateVars);
    }
  });
  // Gets the current signed in user.
  router.post('/', (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = bcrypt.hashSync(req.body.password, 10);
    if (!req.body.email || !req.body.password || !req.body.name) {
      req.flash('error', 'Email, name, and password are required.');
      res.status(404).send({success: false});
      return;
    }

    if (swearjar.profane(req.body.name)) {
      req.flash('error', 'Your Blitz Block Name must be suitable for players of all ages');
      res.status(404).send({success: false});
      return;
    }

    if (req.body.password.length < 8) {
      req.flash('error', 'Password must be at least 8 characters long');
      res.status(404).send({success: false});
      return;
    }

    helpers.checkNameInDB(name)
      .then(exists => {
        if (!exists) {
          helpers.checkEmailInDB(email, password)
            .then(exists => {
              if (!exists) {
                return helpers.registerUser(name, email, password)
                  .then(user_id => {
                    req.session.user_id = user_id;
                    req.flash('success', 'Your account was successfuly registered.');
                    res.status(200).send({success: true});
                  });
              }
              else {
                req.flash('error', 'Email has already been registered.');
                res.status(404).send({success: false});
              }
            });
        }
        else {
          req.flash('error', 'Name has already been used, please pick another');
          res.status(404).send({success: false});
        }
      });

  });

  // Gets the current signed in user.
  router.post('/facebook', (req, res) => {
    const email = req.body.email;
    const name = req.body.name;
    if (!req.body.name) {
      req.flash('facebook-error', 'Must enter name to register');
      res.status(404).send({success: false});
      return;
    }
    if (swearjar.profane(name)) {
      req.flash('facebook-error', 'Your Blitz Block Name must be suitable for players of all ages');
      res.status(404).send({success: false});
      return;
    }

    helpers.checkNameInDB(name)
      .then(exists => {
        if (!exists) {
          helpers.facebookCheckEmailInDB(email)
            .then(exists => {
              if (!exists) {
                helpers.facebookRegisterUser(name, email)
                  .then(user_id => {
                    req.session.user_id = user_id;
                    res.status(200).send({success: true});
                  });
              }
              else {
                req.flash('facebook-error', 'This email is already registered please go to login page');
                res.status(404).send({success: false});
              }
            });
        }
        else {
          req.flash('facebook-error', 'This name has already been used, please pick another');
          res.status(404).send({success: false});

        }
      });
  });


  return router;
};
