const express = require('express');
const User = require('../models/user');
const ObjectID = require('mongodb').ObjectID;

const router = express.Router();

router.get('/', checkAdmin, (req, res) => {
   User.find()
      .then(users => {
         const pageData = {
            pageTitle: 'Users',
            Users: users,
            user: req.user
         };
         res.render('users/viewAll', pageData);
      })
      .catch(() => res.redirect('/error500'));
});

router.post('/:userId/admin', checkAdmin, (req, res) => {
   User.findByIdAndUpdate(req.params.userId, { role: 0 })
      .then(res.redirect('/'))
      .catch(() => res.redirect('/error500'));
});

router.get("/:userId", checkAdmin, (req, res) => {
   User.findById(req.params.userId)
      .populate({ path: 'books' })
      .populate({ path: 'collections' })
      .then(user => {
         if (!user) return res.redirect('/error404');
         let created = user.created.toString();
         created = created.substring(0, created.lastIndexOf('G'));
         const pageData = {
            pageTitle: user.login,
            ...user._doc,
            role: user.role ? 'user' : 'admin',
            created,
            user: req.user,
            myProfile: req.params.userId === req.user.id
         };
         res.render('users/viewOne', pageData);
      })
      .catch(() => res.redirect('/error500'));
});

router.post('/:userId/edit', (req, res) => {
   User.findByIdAndUpdate(req.params.userId, req.body)
      .then(() => res.redirect(`/profile`))
      .catch(() => res.redirect('/error500'));
});


router.post('/:userId/delete', checkYourPage, (req, res) => {
   User.findByIdAndRemove(req.params.userId)
      .then(user => {
         if (req.user.id === req.params.userId) {
            req.logout();
            res.redirect('/');
         } else {
            res.redirect(`/users/`);
         }
      });
});

function checkYourPage(req, res, next) {

   console.log(req.params.userId, ObjectID(req.user._id).toString());
   if (!req.user) return res.sendStatus(401); // 'Not authorized'

   else if (ObjectID(req.user._id).toString() === req.params.userId || req.user.role === 0) {
      next();
   } else {
      res.redirect('/error403');
   }
   // пропускати далі тільки аутентифікованих
}

function checkAdmin(req, res, next) {
   if (!req.user) res.sendStatus(401); // 'Not authorized'
   else if (req.user.role === 1) return res.redirect('/'); // 'Forbidden'
   else next();  // пропускати далі тільки аутентифікованих із роллю 'admin'
}

module.exports = router;