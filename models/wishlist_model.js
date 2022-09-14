const mongoose = require('mongoose')
const Schema= mongoose.Schema

const doc = new mongoose.Schema({
    user_id:{
        type: Schema.Types.ObjectId,
        ref: 'users'

    },
    list:[{
        product:{
        type: Schema.Types.ObjectId,
        ref: 'products'
    },
    } 
]
})
const wishlist=mongoose.model('wishlists',doc)

module.exports=wishlist; 