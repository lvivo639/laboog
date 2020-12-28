const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ColSchema = new Schema({
    name: {
        type : String,
        required: true
    },
    about: {
        type: String,
        required: true
    },
    collect:[
        {
            type: Schema.Types.ObjectId,
            ref: 'Book'
        }
    ],
    creator:{
        type: Schema.Types.ObjectId,
        ref: 'users'
    }
});

const CollModel = mongoose.model('Collection', ColSchema);

class Collection {
    constructor(id,name, about, collect, creator){
        this.id = id;
        this.name = name;
        this.about = about;
        this.collect = collect;
        this.creator = creator;
    }

    static getById(id) {
        return CollModel.findById(id);
    }

    static getAll(){
        return CollModel.find().sort({ date: 'desc' })
    }

    static insert(collection){
        return CollModel.create(collection);
    }

    static update(collId, collection){
        return CollModel.findByIdAndUpdate(collId, collection);
    } 

    static delete(collId){
        return CollModel.findByIdAndDelete(collId);
    }  
}

module.exports = Collection;