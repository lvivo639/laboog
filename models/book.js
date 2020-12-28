const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate');

const BookSchema = new Schema({
   title: {
      type: String,
      required: true
   },
   author: {
      type: String,
      required: true
   },
   date: {
      type: Date,
      default: Date.now
   },
   rating: {
      type: Number,
      default: 100
   },
   about: {
      type: String
   },
   buy: {
      type: String,
      default: '#'
   },
   image: {
      type: String
   },
   imageId: {
      type: String
   },
   creator: {
      type: Schema.Types.ObjectId,
      ref: 'users'
   }
});

const BookModel = mongoose.model('Book', BookSchema);

class Book {
   constructor(title, author, about, buy, image, imageId, creator) {
      this.title = title;
      this.author = author;
      this.about = about;
      this.buy = buy;
      this.image = image;
      this.imageId = imageId;
      this.creator = creator;
   }

   static getById(id) {
      return BookModel.findById(id);
   }

   static getAll() {
      return BookModel.find().sort({ date: 'desc' });
   }

   static getBySearch(str) {
      return BookModel
         .find({
            'title': { $regex: new RegExp(str, "gi") }
         })
         .sort({ date: 'desc' });
   }

   static insert(book) {
      return new BookModel(book).save();
   }

   static update(bookId, book) {
      return BookModel.findByIdAndUpdate(bookId, book);
   }

   static delete(bookId) {
      return BookModel.findByIdAndRemove(bookId);
   }

   static getCollect(booksId) {
      booksId.map(_ => mongoose.Types.ObjectId(_));

      return BookModel.find({
         '_id': { $in: booksId }
      });
   }
}


module.exports = Book;