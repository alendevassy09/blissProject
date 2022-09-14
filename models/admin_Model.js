const mongoose = require('mongoose')

const doc = new mongoose.Schema({
    name:'String',
    email:'String',
    phone:'number',
    password:'string',
    isblocked:'boolean'
})
const admin=mongoose.model('admins',doc)

module.exports=admin;