const mongoose = require('mongoose')
const Schema= mongoose.Schema
// var ObjectId=require('mongodb').ObjectId
const doc = new mongoose.Schema({
    product_name:'String',
    price:'number',
    offerprice:'number',
    stock:'number',
    category:{
        type: Schema.Types.ObjectId,
        ref: 'categories' 
    },
    description:'string',
    size:'array',
    color:'array',
    shape:'string',
    pic:'array',

    // date:{
    //     type:'date',
    //     default:Date.now}
    
},{
    timestamps:true
})
const add_product=mongoose.model('products',doc)

module.exports=add_product;