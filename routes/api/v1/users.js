const express = require('express');
const bcrypt = require('bcrypt');
const auth = require('basic-auth');
const passport = require('passport');

const User = require('../../../models/user');
const inputValidation = require('./input-validation');

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

function checkAdmin(req,res,next){
    if(req.user.role === 0) next();
    else return res.status(403).json({ err: 'Only admins access' });
}

function checkCurrOrAdmin(req,res,next){

    if(req.user.role === 0 || req.user.login === req.params.login) next();
    else return res.status(403).json({ err: 'Forbidden' });

}

router.get("/me", passport.authenticate('basic', { session: false }), (req, res) => {
    // User.findOne({ login: auth(req).name })
    return res.status(200).json(req.user);
});

router.get('/',
    (req, res, next) => {
        // if there is not session user, try basic
        if (!req.user) {
            return passport.authenticate('basic', { session: false });
        }
        next();
    },
    checkAdmin,

    (req,res) => {

    const page = +req.query.page || 1;
    const limit = 10;
    User.find()
        .then(users => {
            const data = pagination(users, page, limit);
            if(+page > data.last) {
                return res.status(404).json({ err: `Page '${page}' not found. Total pages: ${data.last}` });
            }
            return res.status(200).json(data)
        });
});

router.post('/create', (req, res) => {
    let { values, errors, isValid } = inputValidation.createUser(req.body);

    if(!isValid){
        return res.status(400).json({errors, values, isValid});
    }

    User.findOne({ login: req.body.login })
        .then(user => {
            if(user){
                errors.login = 'Login already exist';
                isValid = false;
                return res.status(400).json({errors, values, isValid});
            } else {
                const { login, fullname, password } = req.body;

                const newUser = new User({
                    login, fullname, password
                });

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if(err) throw err;
                        newUser.password = hash;
                        newUser.save()
                            .then(user => res.status(201).json({ ...user._doc, msg: 'Success'}))
                            .catch(err => console.error(err));
                    })
                })
            }
        })
});



router.get('/:login', passport.authenticate('basic', { session: false }), checkCurrOrAdmin, (req, res) => {
    User.findOne({ login: req.params.login })
        .then(user => {
            if(user) return res.status(200).json(user);
        });
});

router.put('/update', passport.authenticate('basic', { session: false }), (req, res) => {

    const { name, pass } = auth(req);

    const { errors, isValid } = inputValidation.updateUser(req.body);

    if (!isValid) {
        return res.status(400).json(errors);
    } else {
        const updateFields = {};

        if (req.body.login) updateFields.login = req.body.login;
        if (req.body.fullname) updateFields.fullname = req.body.fullname;
        if (req.body.role) updateFields.role = req.body.role;
        if (req.body.password) {
            updateFields.password = req.body.password;
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(updateFields.password, salt, (err, hash) => {
                    if(err) throw err;
                    updateFields.password = hash;
                    User.findOneAndUpdate(
                        { login: name },
                        {$set: updateFields},
                        {new: true})
                        .then(user => res.status(200).json(user))
                })
            });
        } else {
            User.findOneAndUpdate(
                { login: name },
                {$set: updateFields},
                {new: true})
                .then(user => res.status(200).json(user))
        }

    }



});

router.delete('/:login/delete', passport.authenticate('basic', { session: false }),checkCurrOrAdmin, (req,res) => {
    User.findOneAndDelete({ login: req.params.login })
        .then(user => {
            if(user) return res.status(200).json({ msg: 'Success' });
        })
});

module.exports = router;