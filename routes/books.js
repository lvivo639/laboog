const express = require('express');
const Book = require('../models/book');
const User = require('../models/user');
const cloudinary = require('cloudinary');

const ObjectID = require('mongodb').ObjectID;

require('dotenv').config()
cloudinary.config({
   cloud_name: process.env.CLOUD_NAME,
   api_key: process.env.CLOUD_API_KEY,
   api_secret: process.env.CLOUD_API_SECRET
});
const router = express.Router();

router.get('/', checkAuth, (req, res) =>
   res.render('books/viewAll', { pageTitle: 'Books list', user: req.user })
);

router.get("/new", checkAuth, (req, res) => {
   res.render('books/add', {
      pageTitle: 'New book',
      user: req.user
   });
});

router.post("/new", checkAuth, (req, res) => {

   const fileObject = req.files.image;
   const fileBuffer = fileObject.data;
   cloudinary.v2.uploader.upload_stream({ resource_type: 'raw' },
      function (error, result) {
         if (error) return res.redirect('/error500');
         const book = new Book(
            req.body.title,
            req.body.author,
            req.body.about,
            req.body.buy,
            result.url,
            result.public_id,
            req.user._id
         );
         Book.insert(book)
            .then(book => {
               User.findById(req.user.id)
                  .then(user => {
                     User.findByIdAndUpdate(user._id, {
                        'books': [book._id, ...user.books]

                     })
                        .then((user) => {
                           return res.redirect('/books');
                        })
                  })
                  .catch(() => res.redirect('/error500'));


            })
            .catch(() => res.redirect('/error500'));
      })
      .end(fileBuffer);

});

router.get("/:bookId", checkAuth, (req, res) => {
   Book.getById(req.params.bookId)
      .then(book => {
         if (!book) return res.redirect('/error404');

         const yourBook = req.user.role === 0 || ObjectID(req.user._id).equals(book.creator);

         const pageData = Object.assign({
               pageTitle: book.title,
               user: req.user,
               yourBook
            },
            book._doc);
         return res.render('books/viewOne', pageData);
      })
      .catch(() => res.redirect('/error500'));
});

router.post('/:bookId/edit', checkYourBook, (req, res) => {
   const book = {
      title: req.body.title,
      author: req.body.author,
      about: req.body.about,
      buy: req.body.buy
   };
   Book.update(req.params.bookId, book)
      .then(book => {
         if (book) res.redirect(`/books/${book._id}`);
         else res.redirect('/error404');
      })
      .catch(() => res.redirect('/error500'));
});

router.post('/:bookId/delete', checkYourBook, (req, res) => {
   Book.delete(req.params.bookId)
      .then(book => {
         if (book) res.redirect(`/books/`);
         else res.redirect('/error404');
      })
      .catch(() => res.redirect('/error500'));
});

function checkAuth(req, res, next) {
   if (!req.user) return res.redirect('/auth/login'); // 'Not authorized'
   next();  // пропускати далі тільки аутентифікованих
}

function checkYourBook(req, res, next) {
   if (!req.user) return res.redirect('/auth/login');

   Book.getById(req.params.bookId)
      .then(book => {
         if (!book) {
            return res.redirect('/error404');
         }else if (ObjectID(req.user._id).toString() !== ObjectID(book.creator).toString() & req.user.role === 1) {
            return res.redirect('/error403');
         }

         next();
      })
      .catch(() => res.redirect('/error500'));
}


module.exports = router;