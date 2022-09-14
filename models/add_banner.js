const mongoose = require('mongoose')
const Schema= mongoose.Schema

const doc = new mongoose.Schema({
   title:'string',
   description:'string',
   pic:'string'
},
{
    timestamps:true
})
const add_banner=mongoose.model('banners',doc)

module.exports=add_banner