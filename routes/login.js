const express = require('express');
const router = express.Router();
const helpers = require('../lib/helpers.js');
// const bcrypt = require('bcrypt');
// add back knex when database is set up properly **************
module.exports = () => {

  // Gets the current signed in user.
  router.get('/', (req, res) => {
    const templateVars = {
      errors: req.flash('error'),
      success: req.flash('success')
    };
    res.render('login', templateVars);
  });

  // Gets the current signed in user.
  router.post('/', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    if (!req.body.email || !req.body.password) {
      console.log('CONSOLE!');
      req.flash('error', 'Both email and password are required');
      res.status(404).send({success: false});
      return;
    }
    helpers.checkEmailInDB(email, password)
      .then(exists => {
        if (exists) {
          helpers.checkLogin(email, password)
            .then(exists => {
              if (exists) {
                req.session.user_id = exists;
                // res.redirect(req.get('referer'));
                req.flash('success', 'You were successfuly logged in');
                res.status(200).send({success: true});
              }
              else {
                req.flash('error', 'Email and password do not match');
                // res.redirect(req.get('referer'));
                res.status(404).send({success: false});
                return;
              }
            });
        }
        else {
          req.flash('error', 'Email is not registered');
          res.status(404).send({success: false});
          return;
        }
      });
    // res.render('login');
  });


  return router;
};



