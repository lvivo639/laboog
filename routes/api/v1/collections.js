const express = require('express');
const bcrypt = require('bcrypt');
const auth = require('basic-auth');
const passport = require('passport');

const ObjectID = require('mongodb').ObjectID;
const User = require('../../../models/user');
const Collection = require('../../../models/collection');

const router = express.Router();

function pagination(data, page, limit){
    const firstItem = ( page - 1 ) * limit;
    let raw = [...Array(limit)].map((_, i) => data[firstItem + i]).filter(_ => _);

    const last = Math.ceil(data.length / limit);
    const mid = 4;

    let beforePage = [...Array(mid)].map((_, i) => page - mid + i).filter(val => val > 0);
    let afterPage = [...Array(mid)].map((_, i) => page + 1 + i).filter(val => val <= last);

    return { raw, beforePage, page, afterPage, last };
}

function checkYourCollection(req,res,next){
    Collection.getById(req.params.id)
        .then(collection => {
            if(collection){
                if(req.user.role === 0 || ObjectID(req.user._id).equals(collection.creator)) next();
                else return res.status(403).json({ err: 'Forbidden' });
            } else {
                return res.status(404).json({ err: 'Collection not found' });
            }
        })
        .catch(err => { return res.status(404).json({ err: err.message })});
}

router.get('/', (req, res, next) => {
        // if there is not session user, try basic
        if (!req.user) {
            return passport.authenticate('basic', { session: false });
        }
        next();
    },
    (req, res) => {
    const page = +req.query.page || 1;
    const limit = 6;
    Collection.getAll()
        .then(collections => {
            const data = pagination(collections, page, limit);
            if(+page > data.last) {
                return res.status(404).json({ err: `Page '${page}' not found. Total pages: ${data.last}` });
            }
            return res.status(200).json(data)
        });
});

router.post('/create', passport.authenticate('basic', { session: false }),(req, res) => {
    //id,name, about, collect, creator

    const name = req.body.name;
    const about = req.body.about;
    const collect = req.body.collect || [];
    const creator = req.user._id;

    Collection.insert(new Collection(null, name, about, collect, creator))
        .then(collection => res.status(200).json(collection))
        .catch(err => res.status(404).json({ err : err.message}));
});

router.get('/:id', passport.authenticate('basic', { session: false }),(req, res) => {
    Collection.getById(req.params.id)
        .then(collection => {
            if(collection) return res.status(200).json(collection);
            else return res.status(404).json({ err: 'Collection not found' });
        })
        .catch(err => res.status(404).json({ err : err.message}));
});

router.put('/:id/update', passport.authenticate('basic', { session: false }),checkYourCollection, (req, res) => {

    const name = req.body.name;
    const about = req.body.about;
    const collect = req.body.collect || [];
    const creator = req.user._id;

    Collection.update(req.params.id, { name, about, collect, creator })
        .then(collection => {
            return res.status(200).json(collection);
        })
});

router.delete('/:id/delete', passport.authenticate('basic', { session: false }), checkYourCollection, (req, res) => {
    Collection.delete(req.params.id)
        .then(collection => {
            return res.status(200).json(collection);
        })
});

module.exports = router;
