const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const bcrypt = require("bcrypt");
const { Schema } = mongoose;

const UserSchema = new mongoose.Schema({
    login: {
        type: String,
        required: true
    },
    fullname: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    },
    role: {
        type: Number,
        default: 1
    },
    password: {
        type: String,
        required: true
    },
    location: {
        type: String
    },
    bio: {
        type: String
    },
    books: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Book'
        }
    ],
    collections: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Collection'
        }
    ]
});


// UserSchema.pre('save', async function (next) {
//     if (!this.isModified('password')) next()
//
//     const salt = await bcrypt.genSalt(10)
//     this.password = await bcrypt.hash(this.password, salt)
// })

UserSchema.plugin(mongoosePaginate);

module.exports = User = mongoose.model('users', UserSchema);
 