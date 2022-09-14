const mongoose = require('mongoose')
const Schema= mongoose.Schema

const doc = new mongoose.Schema({
   coupon:'string',
   couponCode:'string',
   discount:'number',
   users_list:[{
    user:{
    type: Schema.Types.ObjectId,
    ref: 'users'
},
} 
]
   
},
{
    timestamps:true
})
const add_coupon=mongoose.model('coupons',doc)

module.exports=add_coupon;