"use strict";

const express = require('express');
const router  = express.Router();
//add back knex when database is set up properly **************
module.exports = () => {

  // Gets the current signed in user.
  router.get("/", (req, res) => {
  res.render("login");

  });
 // Gets the current signed in user.
  router.post("/", (req, res) => {
    res.render("login");

  });


  return router;
};


