const express = require('express');
const User = require('../models/user');
const Book = require('../models/book');
const Collection = require('../models/collection');
const faker = require('faker');

const router = express.Router();

router.post('/fakeInfo',
    (req, res, next) => {
        if (!req.user) res.sendStatus(401); // 'Not authorized'
        else if (req.user.role === 1) return res.redirect('/'); // 'Forbidden'
        else next();  // пропускати далі тільки аутентифікованих із роллю 'admin'
    },
    async (req, res) => {
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

        let count = 10;
        for (let i = 0; i < count; i++) {
            User.findOne({login: req.body.login})
                .then(async user => {
                    if (!user) {

                        const newUser = new User({
                            login: faker.name.firstName(),
                            fullname: faker.name.findName(),
                            password: 'asdasd',
                            location: faker.address.city() + ", " + faker.address.country(),
                            bio: faker.lorem.sentences()
                        });

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
                                    for (let i = 0; i < c; i++) {
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
                    }

                });


        }

        return res.redirect('/');
    }
);

module.exports = router;