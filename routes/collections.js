const express = require('express');
const Collection = require('../models/collection');
const Book = require('../models/book');
const User = require('../models/user');
const ObjectID = require('mongodb').ObjectID;


const router = express.Router();

router.get('/', checkAuth, (req, res) => {
   res.render('collections/viewAll', { pageTitle: 'Collections list', user: req.user });
});

router.get('/add', checkAuth, (req, res) => {
   Book.getAll()
      .then(data => {
         const pageData = {
            pageTitle: 'New Collection',
            Books: data,
            user: req.user
         };
         res.render('collections/add', pageData);
      })
      .catch(() => res.redirect('/error500'));

});

router.post('/add', checkAuth, (req, res) => {
   const collection = new Collection(null,
      req.body.name,
      req.body.about,
      req.body.books,
      req.user._id
   );
   Collection.insert(collection)
      .then(collection => {
         User.findById(req.user.id)
            .then(user => {
               User.findByIdAndUpdate(user._id, {
                  'collections': [collection._id, ...user.collections]

               })
                  .then(() => res.redirect('/collections'))
            });
      })

      .catch(() => res.redirect('/error500'));
});

router.post('/:collId/edit', checkYourCollection, (req, res) => {
   const { name, about } = req.body;

   Collection.update(req.params.collId, { name, about })

      .then(res.redirect(`/collections/${req.params.collId}`))

      .catch(() => res.redirect('/error500'));
});

router.post('/:collId/delete', checkYourCollection, (req, res) => {
   Collection.delete(req.params.collId)
      .then(res.redirect('/collections'))

      .catch(() => res.redirect('/error500'));
});

router.get("/:collId/add/", checkAuth, (req, res) => {
   Collection.getById(req.params.collId)
      .then(collection => {
         if (collection) {
            return res.render('collections/addBook', {
               user: req.user,
               collectionName: collection.name,
               collectionId: collection._id
            });
         }
      })

      .catch(() => res.redirect('/error500'));
});

router.get("/:id", checkAuth, (req, res) => {
   Collection.getById(req.params.id)
      .populate({ path: 'collect' })
      .then(collection => {
         if (!collection) return res.redirect('/error404');

         const yourCollection = req.user.role === 0 ||
            ObjectID(req.user._id).equals(collection.creator);


         const pageData = Object.assign({
               pageTitle: collection.name,
               user: req.user,
               collId: collection._id,
               yourCollection
            },
            collection._doc);
         res.render('collections/viewOne', pageData);

      })
      .catch(() => res.redirect('/error500'));

});


router.post("/:collId/add/:bookId", checkYourCollection, (req, res) => {
   const { collId, bookId } = req.params;
   Collection.getById(collId)
      .then(collection => {
         if (!collection) return res.redirect('/error404');
         Collection.update(collId, {
            collect: [bookId, ...collection.collect]
         })
            .then((collection) => res.redirect(`/collections/${collection._id}`));

      })
      .catch(() => res.redirect('/error500'));
});


router.post("/:collId/remove/:bookId", checkYourCollection, (req, res) => {
   const { collId, bookId } = req.params;
   Collection.getById(collId)
      .then(collection => {

         if (!collection) return res.redirect('/error404');
         const array = collection.collect;
         const index = array.indexOf(bookId);
         array.splice(index, 1);
         Collection.update(collId, { collect: array })
            .then((collection) => res.redirect(`/collections/${collection._id}`));
      })
      .catch(() => res.redirect('/error'));
});

function checkAuth(req, res, next) {
   if (!req.user) return res.redirect('/auth/login'); // 'Not authorized'
   next();  // пропускати далі тільки аутентифікованих
}

function checkYourCollection(req, res, next) {
   if (!req.user) return res.sendStatus(401); // 'Not authorized'

   Collection.getById(req.params.collId)
      .then(coll => {

         if (!coll) return res.redirect('/error404');

         if (ObjectID(req.user._id).toString() !== ObjectID(coll.creator).toString() & req.user.role === 1) {
            return res.sendStatus(403);
         }
         next();
      })
      .catch(() => res.redirect('/error500'));


}

module.exports = router;