const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const mustache = require('mustache-express');
const busboyBodyParser = require('busboy-body-parser');
const path = require('path');
const bcrypt = require('bcrypt');

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const BasicStrategy = require('passport-http').BasicStrategy;

const cookieParser = require('cookie-parser');
const session = require('express-session');

const User = require('./models/user');

const port = process.env.PORT || 3010;
const dbOptions = {useNewUrlParser: true};
require('dotenv').config()

const app = express();

app.use(busboyBodyParser({limit: '5mb'}));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(cookieParser());
app.use(session({
    secret: "*#&RT(8yrd",
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());


app.engine('mst', mustache(path.join(__dirname, '/views/partials')));

app.set('views', path.join(__dirname, "views"));
app.set('view engine', 'mst');

passport.serializeUser(function (user, done) {
    done(null, user._id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id)
        .then(user => {
            done(user ? null : 'User is exist', user);
        })
});

passport.use(new LocalStrategy((username, password, done) => {
    User.findOne({login: username})
        .then(user => {
            if (user) {
                bcrypt.compare(password, user.password)
                    .then(isMatch => {
                        if (isMatch) {
                            done(null, user);
                        } else {
                            done(null, false, {msg: 'Password incorrect'});
                        }
                    });

            } else {
                done(null, false, {msg: 'User is exist'});
            }
        })
}));

passport.use(new BasicStrategy((name, pass, done) => {
    User.findOne({login: name})
        .then(user => {
            if (user) {
                bcrypt.compare(pass, user.password)
                    .then(isMatch => {
                        return done(null, isMatch ? user : false);
                    });
            } else {
                return done(null, false);
            }
        })
}));

app.use('/users', require('./routes/users'));
app.use('/books', require('./routes/books'));
app.use('/collections', require('./routes/collections'));
app.use('/auth', require('./routes/auth'));

app.use('/api/v1/users', require('./routes/api/v1/users'));
app.use('/api/v1/books', require('./routes/api/v1/books'));
app.use('/api/v1/collections', require('./routes/api/v1/collections'));
app.use('/api/v1', require('./routes/api'));

app.use('/developer/v1', require('./routes/developer'));

app.get("/profile", (req, res, next) => {
    if (!req.user) return res.redirect('/auth/login'); // 'Not authorized'
    next();  // пропускати далі тільки аутентифікованих
}, (req, res) => {
    User.findById(req.user.id)
        .populate({path: 'books'})
        .populate({path: 'collections'})
        .then(user => {
            if (typeof user === 'undefined') {
                return res.redirect('/error404');
            } else {
                let created = user.created.toString();
                created = created.substring(0, created.lastIndexOf('G'));
                const pageData = {
                    pageTitle: user.login,
                    ...user._doc,
                    role: user.role ? 'user' : 'admin',
                    created,
                    user: req.user,
                    myProfile: true
                };
                res.render('users/viewOne', pageData);
            }
        })
        .catch(() => res.redirect('/error500'));
});

app.get('/wakeup', (req, res) => {
    res.send('!')
})

app.get("/", (req, res) => {
    res.render('index', {
        pageTitle: 'Home',
        user: req.user
    });
});

app.get('/error404', (req, res) =>
    res.status(404).render('special/err', {pageTitle: "Page not found"})
);

app.get('/error403', (req, res) =>
    res.status(403).render('special/err', {pageTitle: "Forbidden"})
);

app.get('/error500', (req, res) =>
    res.status(500).render('special/err', {pageTitle: "Internal Server Error"})
);

app.get('*', (req, res) => {
    res.redirect('/error404');
});

mongoose.connect(process.env.MONGO_URI, dbOptions)
    .then(() => console.log('mongodb connected'))
    .then(() => app.listen(port, () => console.log(`PORT: ${port}`)))
    .catch(err => console.error(err));
