const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const mustache = require('mustache-express');
const busboyBodyParser = require('busboy-body-parser');
const path = require('path');
const bcrypt = require('bcrypt');
const faker = require('faker');

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const BasicStrategy = require('passport-http').BasicStrategy;

const cookieParser = require('cookie-parser');
const session = require('express-session');

const User = require('./models/user');
const Book = require('./models/book');
const Collection = require('./models/collection');

const port = process.env.PORT || 3010;
const dbOptions = { useNewUrlParser: true };
require('dotenv').config()

const app = express();

app.use(busboyBodyParser({ limit: '5mb' }));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
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
   User.findOne({ login: username })
      .then(user => {
         if (user) {
            bcrypt.compare(password, user.password)
               .then(isMatch => {
                  if (isMatch) {
                     done(null, user);
                  } else {
                     done(null, false, { msg: 'Password incorrect' });
                  }
               });

         } else {
            done(null, false, { msg: 'User is exist' });
         }
      })
}));

passport.use(new BasicStrategy((name, pass, done) => {
   User.findOne({ login: name })
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

app.get("/", (req, res) => {
   res.render('index', {
      pageTitle: 'Home',
      user: req.user
   });
});

app.get("/profile", (req, res, next) => {
   if (!req.user) return res.redirect('/auth/login'); // 'Not authorized'
   next();  // пропускати далі тільки аутентифікованих
}, (req, res) => {
   User.findById(req.user.id)
      .populate({ path: 'books' })
      .populate({ path: 'collections' })
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

app.post('/fakeInfo',
   (req, res, next) => {
      if (!req.user) res.sendStatus(401); // 'Not authorized'
      else if (req.user.role === 1) return res.redirect('/'); // 'Forbidden'
      else next();  // пропускати далі тільки аутентифікованих із роллю 'admin'
   },
   (req, res) => {
      const imageUrls = [
         "http://res.cloudinary.com/dnak21ged/raw/upload/v1544811696/sncimtto04gdhf3jw71s",
         "http://res.cloudinary.com/dnak21ged/raw/upload/v1544817025/tbpqhqr3kksuynku67d3",
         "http://res.cloudinary.com/dnak21ged/raw/upload/v1544817113/bl0rkpfpya7bp8t766js",
         "http://res.cloudinary.com/dnak21ged/raw/upload/v1544817202/djpigqo8xdemzr19bqxi",
         "http://res.cloudinary.com/dnak21ged/raw/upload/v1544817241/fs9xmy4nylouv7wsuw56",
         "http://res.cloudinary.com/dnak21ged/raw/upload/v1544817938/xl8iibghodv2cmpahlpm",
         "http://res.cloudinary.com/dnak21ged/raw/upload/v1544817964/qdmlwicxv0uwzzp73t3b",
         "http://res.cloudinary.com/dnak21ged/raw/upload/v1544818381/axdbjirrn1fkgg06qkpf",
         "http://res.cloudinary.com/dnak21ged/raw/upload/v1544818487/dd6rskzcbdkghdxew9eb",
         "http://res.cloudinary.com/dnak21ged/raw/upload/v1544876868/wjtgfhhx6xz8pfmt4zjy"
      ];
      const count = 10;
      for (let i = 0; i < count; i++) {
         User.findOne({ login: req.body.login })
            .then(async user => {
               if (!user) {

                  const newUser = new User({
                     login: faker.name.firstName(),
                     fullname: faker.name.findName(),
                     password: 'asdasd',
                     location: faker.address.city() + ", " + faker.address.country(),
                     bio: faker.lorem.sentences()
                  });

                  bcrypt.genSalt(10, (err, salt) => {
                     bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        newUser.password = hash;
                        newUser.save()
                           .then(async user => {
                              const r = faker.random.number() % 7;
                              console.log(r, user.login);
                              for (let i = 0; i < r; i++) {
                                 const im = faker.random.number() % imageUrls.length;
                                 const book = new Book(
                                    faker.random.words(),
                                    faker.name.findName(),
                                    faker.lorem.sentences(),
                                    'http://i.ua',
                                    imageUrls[im],
                                    r,
                                    user._id
                                 );
                                 console.log('book');

                                 await Book.insert(book)
                                    .then(async book => {
                                       await User.findById(user.id)
                                          .then(async user => {
                                             await User.findByIdAndUpdate(user._id, {
                                                'books': [book._id, ...user.books]

                                             })
                                                .then((user) => console.log('ok'))
                                          })


                                    })


                              }

                              const col = faker.random.number() % 6;
                              for (let i = 0; i < col; i++) {
                                 await Book.getAll()
                                    .then(async books => {
                                       const c = faker.random.number() % 15;
                                       let array = [];
                                       for(let i = 0; i < c; i++){
                                          const index = faker.random.number() % books.length;
                                          array.push(books[index]);
                                       }
                                       const collection = new Collection(null,
                                          faker.random.words() + " " + user.login,
                                          faker.lorem.sentences(),
                                          array,
                                          user._id

                                       );
                                       await Collection.insert(collection)
                                          .then(async collection => {
                                             await User.findById(user.id)
                                                .then(async user => {
                                                   await User.findByIdAndUpdate(user._id, {
                                                      'collections': [collection._id, ...user.collections]

                                                   })
                                                      .then((user) => console.log('coll user added'))
                                                })


                                          })
                                    })
                              }

                           })
                     })
                  })
               }

            });


      }

      return res.redirect('/');
   }
);


app.use('/users', require('./routes/users'));
app.use('/books', require('./routes/books'));
app.use('/collections', require('./routes/collections'));
app.use('/auth', require('./routes/auth'));

app.use('/api/v1', require('./routes/api'));
app.use('/api/v1/users', require('./routes/api/v1/users'));
app.use('/api/v1/books', require('./routes/api/v1/books'));
app.use('/api/v1/collections', require('./routes/api/v1/collections'));

app.use('/developer/v1', require('./routes/developer'));


app.get('/error404', (req, res) =>
   res.status(404).render('special/err', { pageTitle: "Page not found" })
);

app.get('/error403', (req, res) =>
   res.status(403).render('special/err', { pageTitle: "Forbidden" })
);

app.get('/error500', (req, res) =>
   res.status(500).render('special/err', { pageTitle: "Internal Server Error" })
);

app.get('*', (req, res) => {
   res.redirect('/error404');
});

mongoose.connect(process.env.MONGO_URI, dbOptions)
   .then(() => console.log('mongodb connected'))
   .then(() => app.listen(port, () => console.log(`PORT: ${port}`)))
   .catch(err => console.error(err));
