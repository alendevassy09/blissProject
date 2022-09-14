const db=require('../models/signup_Model')
const cart=require('../models/cart_model')
const user = require('../models/signup_Model')
var objectId=require('mongodb').ObjectId
const coupon = require('../models/add_coupon')
module.exports={

    // add_to_cart:(id,body)=>{
    //     return new Promise(async(resolve,reject)=>{
    //         // var user= await db.findOne({email:body}).lean()
    //         var user= await cart.findOne({email:body}).lean()
    //         console.log(user);
    //         // await db.updateOne({email:body},{$push:{cart:{_id:objectId(id)}}}).then(()=>{
    //         //     resolve()
    //         // })
    //         await cart.updateOne({email:body},{$push:
    //             {cart:{
    //                 user:{_id:objectId(user._id)},
    //                product:{_id:objectId(product_id)},
    //                quantity:'number',
    //             }        
    //             }
    //         }).then(()=>{
    //             resolve()
    //         })

    //     })
        
    // }
    add_to_cart:(product_id,user_id,body)=>{

        return new Promise(async(resolve,reject)=>{
            try {
                var status=true
                const user=await cart.findOne({user_id:objectId(user_id)})
                  console.log('----------rs--------------------------');
                  console.log(body);
                  if(user){
                     const user_cart= await cart.findOne({user_id:objectId(user_id),carts:{$elemMatch:{product:objectId(product_id)}}})
                     console.log(user_cart);
                  //    
                     if(user_cart){
                      console.log('working one');
                      await cart.updateOne({user_id:objectId(user_id),carts:{$elemMatch:{product:objectId(product_id)}}},{$set:{"carts.$.color":body.color,"carts.$.size":body.size},$inc:{"carts.$.quantity":body.quantity}})
                      status=false
                      resolve(status)
                     }else{
                      console.log('working two');
                      await cart.updateOne({user_id:objectId(user_id)},{$push:{carts:{product:product_id,quantity:body.quantity,color:body.color,size:body.size}}})
                      resolve(status)
                     }
                    
                  }else{
                      await cart.create({user_id:user_id,carts:[{product:product_id,quantity:body.quantity,size:body.size,color:body.color}]})
                      resolve(status)
                  }
                
            } catch (error) {
                reject(error)
            }
           
        })

    },
    show_cart:(user_id)=>{ 
        return new Promise(async(resolve,reject)=>{

            try {
                //  let coupon_exist = await coupon.findOne({users_list:{$ne:{$elemMatch:{user:objectId(user_id)}}}}).lean()
                
            
                let coupon_exist = await coupon.find().lean()
                console.log('----------exist');
                console.log(coupon_exist);
                


                var totalprice=0
                var qty=0
               await cart.findOne({user_id:objectId(user_id)}).populate('carts.product').lean().then((products)=>{
                console.log(products);
                if(products){
                    let total=[]
                    for(let i=0;i<products.carts.length;i++){
                        // console.log(products.carts[i].product.offerprice);
                        totalprice=totalprice+products.carts[i].product.offerprice
                        
                        qty=qty+products.carts[i].quantity
                        total[i]=totalprice*qty
                        totalprice=0
                        qty=0
                    }
                    for(let i=0;i<total.length;i++){
                        totalprice=totalprice+total[i]
                    }

                    

                    products.totalprice=totalprice
                    products.coupon=coupon_exist
                    resolve(products)
                }else{
                    resolve(products)
                }
                })
                
            } catch (error) {
                reject(error)
            }

           
           
        })
    },
    inc_qty:(body)=>{
        return new Promise(async(resolve,reject)=>{
            try {
                await cart.updateOne({user_id:objectId(body.user_id),carts:{$elemMatch:{product:objectId(body.product_id)}}},{$inc:{"carts.$.quantity":1}})
                resolve('ok')
                
            } catch (error) {
                reject(error)
            }
          
       
        })
    },
    dec_qty:(body)=>{
       
        
        return new Promise(async(resolve,reject)=>{
          try {
            await cart.updateOne({user_id:objectId(body.user_id),carts:{$elemMatch:{product:objectId(body.product_id)}}},{$inc:{"carts.$.quantity":-1}})
            resolve('ok')
          } catch (error) {
            reject(error)
          }
            
         
        })
    }

}