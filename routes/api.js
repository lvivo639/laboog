const express = require('express');
const bcrypt = require('bcrypt');
const auth = require('basic-auth');
const passport = require('passport');

const User = require('../models/user');

const router = express.Router();


router.get('/auth/:login', (req, res) => {
   User.findOne({ login: req.params.login })
      .then(user => res.status(200).json({user: !!user}));
});


module.exports = router;
