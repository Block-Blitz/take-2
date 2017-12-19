const express = require('express');
const router = express.Router();
const helpers = require('../lib/helpers.js');
const bcrypt = require('bcrypt');
// add back knex when database is set up properly **************
module.exports = () => {

  // Gets the current signed in user.
  router.get('/', (req, res) => {
    const templateVars = {
      errors: req.flash('error'),
      success: req.flash('success')
    };
    res.render('register', templateVars);
  });
  // Gets the current signed in user.
  router.post('/', (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = bcrypt.hashSync(req.body.password, 10);
    if (!req.body.email || !req.body.password || !req.body.name) {
      req.flash('error', 'Both email and password are required.');
      res.status(404).send({success: false});
      return;
    }
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
  });


  return router;
};
