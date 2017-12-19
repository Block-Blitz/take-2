"use strict";

const express = require('express');
const router = express.Router();
const helpers = require('../lib/helpers.js');
const flash = require('connect-flash');
//const bcrypt = require('bcrypt');
//add back knex when database is set up properly **************
module.exports = () => {

  // Gets the current signed in user.
  router.get("/", (req, res) => {
  res.render("login");

  });
 // Gets the current signed in user.
  router.post("/", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    if (!req.body.email || !req.body.password) {
      console.log('CONSOLE!')
    req.flash('error', 'Both email and password are required');
    res.redirect(req.get('referer'));
    return;
  }
  helpers.checkEmailInDB(email, password)
  .then(exists => {
    if (exists) {
      helpers.checkLogin(email, password)
      .then(exists => {


        if (exists) {
          console.log("checking for headers being sent");
          req.session.user_id = exists;
          // res.redirect(req.get('referer'));
          req.flash('error', 'You were successfuly logged in');
          res.status(200);

        } else {

          req.flash('error', 'Email and password do not match');
          res.redirect(req.get('referer'));
          return;
        }

      });

    } else {

      req.flash('error', 'Email is not registered');
      res.redirect(req.get('referer'));
      return;
    }
  });

    //res.render("login");

  });


  return router;
};


