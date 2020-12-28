const express = require('express');
const bcrypt = require('bcrypt');
const auth = require('basic-auth');
const passport = require('passport');

const ObjectID = require('mongodb').ObjectID;
const User = require('../../../models/user');
const Book = require('../../../models/book');

const router = express.Router();

function pagination(data, page, limit){

    const firstItem = ( page - 1 ) * limit;

    let raw = [...Array(limit)].map((_, i) => data[firstItem + i]).filter(el => el);

    const last = Math.ceil(data.length / limit);

    const mid = 4;

    let beforePage = [...Array(mid)].map((_, i) => page - mid + i).filter(val => val > 0);
    let afterPage = [...Array(mid)].map((_, i) => page + 1 + i).filter(val => val <= last);

    return { raw, beforePage, page, afterPage, last };
}

function checkYourBook(req, res, next) {
    Book.getById(req.params.id)
        .then(book => {
            if(book){
                if(req.user.role === 0 || ObjectID(req.user._id).equals(book.creator)) next();
                else return res.status(403).json({ err: 'Forbidden' });
            } else {
                return res.status(404).json({ err: 'Book not found' });
            }
        })
        .catch(err => { return res.status(404).json({ err: err.message })});
}

router.get('/',
    (req, res, next) => {
        // if there is not session user, try basic
        if (!req.user) {
            return passport.authenticate('basic', { session: false });
        }
        next();
    },
    (req, res) => {
    const page = +req.query.page || 1;
    const search = req.query.search || '';
    const limit = 3;
    Book.getBySearch(search)
        .then(books => {
            const data = pagination(books, page, limit);
            // console.log(data)
            if(data.last === 0) return res.status(404).json({ err: `Books not found` });

            if(page > data.last || page < 0) {
                return res.status(404).json({ err: `Page '${page}' not found. Total pages: ${data.last}` });
            }
            return res.status(200).json(data)
        });
});

router.post('/create', passport.authenticate('basic', { session: false }),(req, res) => {

    const title = req.body.title;
    const author = req.body.author;
    const about = req.body.about || '';
    const buy = req.body.buy || '';
    const image = req.body.image || '';
    const imageId = req.body.imageId || '';
    const creator = req.user._id;

    Book.insert(new Book(null,title,author, about, buy,image,imageId, creator))
        .then(book => res.status(201).json(book))
        .catch(err => res.status(404).json({ err : err.message }));
});

router.get('/:id', passport.authenticate('basic', { session: false }),(req, res) => {
    Book.getById(req.params.id)
        .then(book => {
            if(book) return res.status(200).json(book);
            else return res.status(404).json({ err: 'Book not found' });
        })
        .catch(err => res.status(404).json({ err : err.message}));
});

router.put('/:id/update', passport.authenticate('basic', { session: false }),checkYourBook, (req, res) => {

    const title = req.body.title;
    const author = req.body.author;
    const about = req.body.about || '';
    const buy = req.body.buy || '';
    const image = req.body.image || '';
    const imageId = req.body.imageId || '';

    const updateFields = { title, author, about, buy, image, imageId };

    Book.update(req.params.id, updateFields)
        .then(book => {
            return res.status(200).json(book);
        })
});

router.delete('/:id/delete', passport.authenticate('basic', { session: false }), checkYourBook, (req, res) => {
    Book.delete(req.params.id)
        .then(book => {
            return res.status(200).json(book);
        })
});

module.exports = router;