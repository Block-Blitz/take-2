const express = require('express');
const router = express.Router();

module.exports = () => {

  router.get('/', (req, res) => {
    const templateVars = {
      errors: req.flash('error'),
      success: req.flash('success'),
      user: req.session.user_id
    };
    res.render('privacy', templateVars);
  });

  return router;
};



