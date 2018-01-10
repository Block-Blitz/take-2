const express = require('express');
const router = express.Router();
// add back knex when database is set up properly **************
module.exports = () => {

  router.post('/', (req, res) => {
    req.session.user_id = null;
    res.status(200).send({success: true});
  });

  return router;
};
