const mongoose = require('mongoose')

const Schema = mongoose.Schema
const CategorySchema = new Schema({
    name: {
        type: String,
        require: true
    }, dateCreated: {
        type: Date,
        require: true
    }, dateModified: {
        type: Date,
        default: null
    }
})

module.exports = mongoose.model('categories', CategorySchema)