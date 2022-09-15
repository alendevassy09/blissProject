const mongoose = require('mongoose');

module.exports={
  con:()=>{
    return mongoose.connect(process.env.DB).then(()=>{
      console.log('mongoose connected');
    }).catch((err)=>{
      console.log('not connected'+err);
    })
  }


}

