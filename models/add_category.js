const mongoose = require('mongoose')

const doc = new mongoose.Schema({
   category:'string'
})
const add_category=mongoose.model('categories',doc)

module.exports=add_category;