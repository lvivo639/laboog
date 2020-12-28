const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
    res.render('dev', {});
});

router.get('/users', (req, res) => {
    const users = {
        pageTitle: 'Users',
        data:[
            {
                method: 'GET',
                path: '/users/',
                access: 'Admins only',
                returnData: 'Json object with users',
                queryParams: [
                    {
                        param: 'page',
                        text: 'Page parameter for pagination'
                    }
                ],
                responses:[
                    {
                        status: 200,
                        text: 'successful operation'
                    },
                    {
                        status: 404,
                        text: 'page not found'
                    },
                    {
                        status: 400,
                        text: 'password incorrect'
                    },
                    {
                        status: 403,
                        text: 'Forbidden'
                    }
                ]
            },
            {
                method: 'POST',
                path: '/users/create',
                access: 'All',
                returnData: 'Creates new user',
                bodyReq:[
                    {
                        param: 'login',
                        text: 'user login',
                        required: 'true',
                        type: 'string'
                    },
                    {
                        param: 'fullname',
                        text: 'user\'s full name',
                        required: 'true',
                        type: 'string'
                    },
                    {
                        param: 'password',
                        text: 'user\'s password',
                        required: 'true',
                        type: 'string'
                    },
                    {
                        param: 'password2',
                        text: 'user\'s password confirm',
                        required: 'true',
                        type: 'string'
                    }
                ],
                responses:[
                    {
                        status: 400,
                        text: 'data not valid'
                    },
                    {
                        status: 201,
                        text: 'new user data'
                    }

                ]
            },
            {
                method: 'GET',
                path: '/users/{login}',
                access: 'Admin and only own page',
                returnData: 'Data of user with login {login}',
                pathParams:[
                    {
                        param: 'login',
                        text: 'user\'s login'
                    }
                ],
                responses:[
                    {
                        status: 200,
                        text: 'ok'
                    },
                    {
                        status: 400,
                        text: 'password incorrect'
                    },
                    {
                        status: 403,
                        text: 'Forbidden'
                    },
                    {
                        status: 404,
                        text: 'page not found'
                    }
                ]
            },
            {
                method: 'PUT',
                path: '/users/update',
                access: 'Only own page',
                returnData: 'Updated user\'s data',
                bodyReq:[
                    {
                        param: 'login',
                        text: 'user login',
                        required: 'false',
                        type: 'string'
                    },
                    {
                        param: 'fullname',
                        text: 'user\'s full name',
                        required: 'false',
                        type: 'string'
                    },
                    {
                        param: 'password',
                        text: 'user\'s password',
                        required: 'false',
                        type: 'string'
                    },
                    {
                        param: 'password2',
                        text: 'user\'s password confirm',
                        required: 'false',
                        type: 'string'
                    }
                ],
                responses:[
                    {
                        status: 200,
                        text: 'ok'
                    },
                    {
                        status: 400,
                        text: 'password incorrect'
                    },
                    {
                        status: 403,
                        text: 'Forbidden'
                    }
                ]
            },
            {
                method: 'DELETE',
                path: '/users/{login}/delete',
                access: 'Admin and only own page',
                returnData: 'Data of deleted user',
                pathParams:[
                    {
                        param: 'login',
                        text: 'user\'s login'
                    }
                ],
                responses:[
                    {
                        status: 200,
                        text: 'ok'
                    },
                    {
                        status: 400,
                        text: 'password incorrect'
                    },
                    {
                        status: 403,
                        text: 'Forbidden'
                    },
                    {
                        status: 404,
                        text: 'user not found'
                    }
                ]
            },
            {
                method: 'GET',
                path: '/users/me',
                access: 'Only own page',
                returnData: 'Data of own page',
                responses:[
                    {
                        status: 200,
                        text: 'ok'
                    },
                    {
                        status: 400,
                        text: 'password incorrect'
                    },
                    {
                        status: 403,
                        text: 'Forbidden'
                    }
                ]
            }
        ]
    };
    res.render('developer', users);
});

router.get('/books', (req, res) => {
    const books = {
        pageTitle: 'Books',
        data:[
            {
                method: 'GET',
                path: '/books/',
                access: 'Authenticated',
                returnData: 'Json object with books',
                queryParams: [
                    {
                        param: 'page',
                        text: 'Page parameter for pagination'
                    },
                    {
                        param: 'search',
                        text: 'Search parameter for search'
                    }
                ],
                responses:[
                    {
                        status: 200,
                        text: 'successful operation'
                    },
                    {
                        status: 404,
                        text: 'page not found'
                    },
                    {
                        status: 400,
                        text: 'password incorrect'
                    },
                    {
                        status: 403,
                        text: 'Forbidden'
                    }
                ]
            },
            {
                method: 'POST',
                path: '/books/create',
                access: 'Authenticated',
                returnData: 'Creates new book',
                bodyReq:[
                    {
                        param: 'title',
                        text: 'book\'s title',
                        required: 'true',
                        type: 'string'
                    },
                    {
                        param: 'author',
                        text: 'book\'s author',
                        required: 'true',
                        type: 'string'
                    },
                    {
                        param: 'about',
                        text: 'about the book',
                        required: 'false',
                        type: 'string'
                    },
                    {
                        param: 'buy',
                        text: 'link for purchase page',
                        required: 'false',
                        type: 'string'
                    },
                    {
                        param: 'image',
                        text: 'link for book\'s cover',
                        required: 'false',
                        type: 'string'
                    },
                    {
                        param: 'imageId',
                        text: 'id of image in database',
                        required: 'false',
                        type: 'string'
                    }
                ],
                responses:[
                    {
                        status: 400,
                        text: 'data not valid'
                    },
                    {
                        status: 201,
                        text: 'new book data'
                    },
                    {
                        status: 400,
                        text: 'password incorrect'
                    },
                    {
                        status: 404,
                        text: 'user not found'
                    }
                ]
            },
            {
                method: 'GET',
                path: '/books/{id}',
                access: 'Authenticated',
                returnData: 'Data of book with id {id}',
                pathParams:[
                    {
                        param: 'id',
                        text: 'book\'s id'
                    }
                ],
                responses:[
                    {
                        status: 200,
                        text: 'ok'
                    },
                    {
                        status: 400,
                        text: 'password incorrect'
                    },
                    {
                        status: 403,
                        text: 'Forbidden'
                    },
                    {
                        status: 404,
                        text: 'page not found'
                    }
                ]
            },
            {
                method: 'PUT',
                path: '/books/{id}/update',
                access: 'Admins and own books',
                returnData: 'Updated book\'s data',
                bodyReq:[
                    {
                        param: 'title',
                        text: 'book\'s title',
                        required: 'true',
                        type: 'string'
                    },
                    {
                        param: 'author',
                        text: 'book\'s author',
                        required: 'true',
                        type: 'string'
                    },
                    {
                        param: 'about',
                        text: 'about the book',
                        required: 'false',
                        type: 'string'
                    },
                    {
                        param: 'buy',
                        text: 'link for purchase page',
                        required: 'false',
                        type: 'string'
                    },
                    {
                        param: 'image',
                        text: 'link for book\'s cover',
                        required: 'false',
                        type: 'string'
                    },
                    {
                        param: 'imageId',
                        text: 'id of image in database',
                        required: 'false',
                        type: 'string'
                    }
                ],
                pathParams:[
                    {
                        param: 'id',
                        text: 'book\'s id'
                    }
                ],
                responses:[
                    {
                        status: 200,
                        text: 'ok'
                    },
                    {
                        status: 400,
                        text: 'password incorrect'
                    },
                    {
                        status: 403,
                        text: 'Forbidden'
                    },
                    {
                        status: 404,
                        text: 'book not found'
                    }
                ]
            },
            {
                method: 'DELETE',
                path: '/books/{id}/delete',
                access: 'Admin and own books',
                returnData: 'Data of deleted book',
                pathParams:[
                    {
                        param: 'id',
                        text: 'book\'s id'
                    }
                ],
                responses:[
                    {
                        status: 200,
                        text: 'ok'
                    },
                    {
                        status: 400,
                        text: 'password incorrect'
                    },
                    {
                        status: 403,
                        text: 'Forbidden'
                    },
                    {
                        status: 404,
                        text: 'book not found'
                    }
                ]
            }
        ]
    };
    res.render('developer', books);
});

router.get('/collections', (req, res) => {
    const collections = {
        pageTitle: 'Collections',
        data:[
            {
                method: 'GET',
                path: '/collections/',
                access: 'Authenticated',
                returnData: 'Json object with collections',
                queryParams: [
                    {
                        param: 'page',
                        text: 'Page parameter for pagination'
                    }
                ],
                responses:[
                    {
                        status: 200,
                        text: 'successful operation'
                    },
                    {
                        status: 404,
                        text: 'page not found'
                    },
                    {
                        status: 400,
                        text: 'password incorrect'
                    },
                    {
                        status: 403,
                        text: 'Forbidden'
                    }
                ]
            },
            {
                method: 'POST',
                path: '/collections/create',
                access: 'Authenticated',
                returnData: 'Creates new collection',
                bodyReq:[
                    {
                        param: 'name',
                        text: 'collection\'s name',
                        required: 'true',
                        type: 'string'
                    },
                    {
                        param: 'about',
                        text: 'about the collection',
                        required: 'true',
                        type: 'string'
                    },
                    {
                        param: 'collect',
                        text: 'collection\'s author',
                        required: 'false',
                        type: 'array of collection\'s books'
                    }
                ],
                responses:[
                    {
                        status: 400,
                        text: 'data not valid'
                    },
                    {
                        status: 201,
                        text: 'new collection data'
                    },
                    {
                        status: 400,
                        text: 'password incorrect'
                    },
                    {
                        status: 404,
                        text: 'user not found'
                    }
                ]
            },
            {
                method: 'GET',
                path: '/collections/{id}',
                access: 'Authenticated',
                returnData: 'Data of collection with id {id}',
                pathParams:[
                    {
                        param: 'id',
                        text: 'collection\'s id'
                    }
                ],
                responses:[
                    {
                        status: 200,
                        text: 'ok'
                    },
                    {
                        status: 400,
                        text: 'password incorrect'
                    },
                    {
                        status: 403,
                        text: 'Forbidden'
                    },
                    {
                        status: 404,
                        text: 'page not found'
                    }
                ]
            },
            {
                method: 'PUT',
                path: '/collections/{id}/update',
                access: 'Admins and own collections',
                returnData: 'Updated collection\'s data',
                bodyReq:[
                    {
                        param: 'name',
                        text: 'collection\'s name',
                        required: 'false',
                        type: 'string'
                    },
                    {
                        param: 'about',
                        text: 'about the collection',
                        required: 'false',
                        type: 'string'
                    },
                    {
                        param: 'collect',
                        text: 'collection\'s author',
                        required: 'false',
                        type: 'array of collection\'s books'
                    }
                ],
                pathParams:[
                    {
                        param: 'id',
                        text: 'collection\'s id'
                    }
                ],
                responses:[
                    {
                        status: 200,
                        text: 'ok'
                    },
                    {
                        status: 400,
                        text: 'password incorrect'
                    },
                    {
                        status: 403,
                        text: 'Forbidden'
                    },
                    {
                        status: 404,
                        text: 'collection not found'
                    }
                ]
            },
            {
                method: 'DELETE',
                path: '/collections/{id}/delete',
                access: 'Admin and own collections',
                returnData: 'Data of deleted collection',
                pathParams:[
                    {
                        param: 'id',
                        text: 'collection\'s id'
                    }
                ],
                responses:[
                    {
                        status: 200,
                        text: 'ok'
                    },
                    {
                        status: 400,
                        text: 'password incorrect'
                    },
                    {
                        status: 403,
                        text: 'Forbidden'
                    },
                    {
                        status: 404,
                        text: 'book not found'
                    }
                ]
            }
        ]
    };
    res.render('developer', collections);
});

module.exports = router;
