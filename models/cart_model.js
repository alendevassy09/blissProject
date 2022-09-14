const mongoose = require('mongoose')
const Schema= mongoose.Schema

const doc = new mongoose.Schema({
    user_id:{
        type: Schema.Types.ObjectId,
        ref: 'users'

    },
    carts:[{
        product:{
        type: Schema.Types.ObjectId,
        ref: 'products'
    },
    quantity:{type:'number',minimum:1},
    size:'string',
    color:'string'
}
]
})
const cart=mongoose.model('carts',doc)

module.exports=cart; 