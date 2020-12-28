const express = require('express');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const passport = require('passport');

const router = express.Router();

router.get('/register',
   (req, res, next) => {
      if (req.user) return res.redirect('/');
      next();
   },
   (req, res) => {
      res.render('users/register', {
         pageTitle: "Sign Up",
         error: req.query.error || ''
      });
   });


router.get('/login',
   (req, res, next) => {
      if (req.user) return res.redirect('/');
      next();
   },
   (req, res) => {
      res.render('users/login', {
         pageTitle: 'Log In',
         login: req.query.login || "",
         error: req.query.error || ""
      })
   });

router.post('/login',
   passport.authenticate('local', { failureRedirect: '/auth/login?error=Login+or+password+is+incorrect' }),
   (req, res) => {
      res.redirect('/');
   });

router.get('/logout', checkAuth, (req, res) => {
   req.logout();
   res.redirect('/');
});

function checkAuth(req, res, next) {
   if (!req.user) return res.redirect('/auth/login'); // 'Not authorized'
   next();  // пропускати далі тільки аутентифікованих
}

module.exports = router;
