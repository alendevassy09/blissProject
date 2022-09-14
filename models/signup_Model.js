const mongoose = require('mongoose')
const Schema= mongoose.Schema

const doc = new mongoose.Schema({
    fname:'String',
    lname:'String',
    email:'String',
    phone:'number',
    birthday:'string',
    alternate_no:'number',
    password:'string',
    isblocked:'boolean',
        cart:[{
            product:{
            type: Schema.Types.ObjectId,
            ref: 'products'
        },
        quantity:'string'
    },
        
    ]

    
           
        
})
const user=mongoose.model('users',doc)

module.exports=user; 