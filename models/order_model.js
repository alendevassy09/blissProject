const mongoose = require('mongoose')
const Schema= mongoose.Schema

const doc = new mongoose.Schema({
    user_id:{
        type: Schema.Types.ObjectId,
        ref: 'users'

    },
    fname:'string',
    lname:'string',
    company:"string",
    number:"string",
    email:'string',
    add1:'string',
    locality:'string',
    town:'string',
    district:'string',
    zip:"string",
    coupon_name:'string',
    coupon_discount:'string',
    method:"string",
    saved_price:'string',
    status:'string',
    online:'string',
    total:'string',
    payment:'string',
    checkDate:'string',
    date:{ type: Date, default: Date.now },
    products:[{
        product:{
        type: Schema.Types.ObjectId,
        ref: 'products'
    },
    quantity:'number',
    color:'string',
    size:"string"    
}
    
]
},{
    
    timestamps: { createdAt: true }
})
const orders=mongoose.model('orders',doc)

module.exports=orders; 