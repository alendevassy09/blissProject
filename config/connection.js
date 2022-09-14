const mongoose = require('mongoose');

module.exports={
  con:()=>{
    return mongoose.connect('mongodb://localhost:27017/project').then(()=>{
      console.log('mongoose connected');
    }).catch((err)=>{
      console.log('not connected'+err);
    })
  }


}

