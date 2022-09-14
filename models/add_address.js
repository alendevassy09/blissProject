const mongoose = require('mongoose')
const Schema= mongoose.Schema
const doc = new mongoose.Schema({
    user_id:{
        type: Schema.Types.ObjectId,
        ref: 'users'

    },
    name:'string',
   add1:'string',
   locality:'string',
   town:'string',
   district:'string',
   pincode:'number'

})
const address=mongoose.model('addresses',doc)

module.exports=address;