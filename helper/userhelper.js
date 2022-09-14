const db=require('../models/signup_Model')
const bcrypt= require('bcrypt')
const coupon = require('../models/add_coupon')
const address= require('../models/add_address')
var objectId=require('mongodb').ObjectId
var cart=require('../models/cart_model')
const Razorpay = require('razorpay');
const add_product=require('../models/add_products')
const order= require('../models/order_model')
const { category } = require('../middlewares/usermiddle')

var instance = new Razorpay({
  key_id: 'rzp_test_KQe6dfb0emexIF',
  key_secret: 'pk7LJE9n4CNFDb2rBtD1vaFy',
});

module.exports={


    userSignup:(userDetails)=>{

   
    console.log(userDetails);
    return new Promise(async(resolve,reject)=>{
        try {
            let user=await db.findOne({email:userDetails.email})
        console.log('this is user');
        console.log(user);
        const state={
            userExist:false
        }
        if(!user){
            // userDetails.password=await bcrypt.hash(userDetails.password,10)
            // db.create(userDetails).then(()=>{
            //     console.log('alright');
            //     resolve(state)
            // }).catch((err)=>{
            //     console.log(err);
            //     console.log('not alright');
            // })
            resolve(state)
        }else{
            state.userExist=true;
            resolve(state)
        }
        } catch (error) {
            reject(error)
        }
        
        
    })
},
verification:(body)=>{
    return new Promise(async(resolve,reject)=>{
        try {
            body.password=await bcrypt.hash(body.password,10)
            db.create(body).then(()=>{
                console.log('alright');
                resolve()
                }).catch((err)=>{
                    console.log(err);
                    console.log('not alright');
                })
            
        } catch (error) {
            reject(error)
        }
       
    })
           

},
    userLogin:(loginDetails)=>{
        console.log(loginDetails.email);
        let response={}
    return new Promise(async(resolve,reject)=>{
        try {
            let user = await db.findOne({email:loginDetails.email})
      console.log('this is user');
      console.log(user);
      
      if(user){
        bcrypt.compare(loginDetails.password,user.password).then((status)=>{
            console.log(user.isblocked);
            if(status){
                console.log('login success');
                response.isblocked=user.email
                response.user_id=user._id
                response.status=true
                resolve(response)
            }else{
                console.log('login not success');
                response.status=false
                resolve(response)
            }
        })
      }else{
        console.log('login failed');
        response.status=false
        resolve(response)
      }
        } catch (error) {
            reject(error)
        }
      
    })
    },
    forgot_Password:(forgot_details)=>{
        console.log(forgot_details.email);
        let response={
            forgot_email:false
        }
        return new Promise(async(resolve,reject)=>{
            try {
                var user=await db.findOne({email:forgot_details.email})
                console.log(user);
                if(user){
                    response.isblocked=user.email
                    response.phone=user.phone
                    response.forgot_email=true
                    resolve(response)
                }else{
                    resolve(response,user)
                }
            } catch (error) {
                reject(error)
            }
           
        })

    },
    have_used:(user_id,coupon_code)=>{
        return new Promise(async(resolve,reject)=>{
            try {
                
                let response={
                    status:false,
    
                }
                let coupon_discount=await coupon.findOne({couponCode:coupon_code})
                let user_coupon = await coupon.findOne({couponCode:coupon_code,users_list:{$elemMatch:{user:objectId(user_id)}}})
                console.log('------coupon find');
                console.log(user_coupon);
              if(user_coupon){
                
                response.status=true
              }else{
                console.log(coupon_discount.discount);    
                response.discount=coupon_discount.discount    
              }
                resolve(response)
            } catch (error) {
                reject(erro)
            }
            
        })
    },
    getAddress:(user_id)=>{
        return new Promise(async(resolve,reject)=>{
            try {
                let address_details= await address.find({user_id:objectId(user_id)}).lean()
                resolve(address_details)
            } catch (error) {
                reject(error)
            }
        })
    },
    getUserProfile:(id)=>{
        return new Promise(async(resolve,reject)=>{
            try {
                let profile = await db.findOne({_id:objectId(id)}).lean()
                resolve(profile)
            } catch (error) {
                reject(error)
            }
           

        })
    },
    edit_profile:(id,body)=>{
        return new Promise(async(resolve,reject)=>{
            try {
                await db.updateOne({_id:objectId(id)},{$set:{
                    fname:body.fname,
                    lname:body.lname,  
                    email:body.email,
                    phone:body.phone,
                    alternate_no:body.alternate_no,
                    birthday:body.birthday
                }})
                resolve()
            } catch (error) {
                reject(error)
            }
        })
    },
    add_address:(user_id,body)=>{
        return new Promise(async(resolve,reject)=>{
            try {
                body.user_id=user_id
            await address.create(body)
            resolve()
                
            } catch (error) {
                reject(error)
            }
            
        })
    },
    delete_add:(id)=>{
        return new Promise(async(resolve,reject)=>{
            try {
                await address.deleteOne({_id:objectId(id.id)})
                resolve()
            } catch (error) {
                reject(error)
            }
           
        })
    },
    setAddress:(id)=>{
        return new Promise(async(resolve,reject)=>{
            try{
                let add=await address.findOne({_id:id}).lean()
                resolve(add)
            }catch(error){
                reject(error)
            }
        })
    },
    generateRazorpay:(orderId,total)=>{
        return new Promise(async(resolve,reject)=>{
           var option= {
                amount: total*100,
                currency: "INR",
                receipt: ''+orderId,
                notes: {
                  key1: "value3",
                  key2: "value2"
                }
              }
            instance.orders.create(option,(err,order)=>{
                console.log('---------order');
                console.log(order);
                resolve(order)
            })
        })
    },
    verifyPayment:(body,id)=>{
        return new Promise(async(resolve,reject)=>{
            const crypto=require('crypto')
            let hmac=crypto.createHmac('sha256','pk7LJE9n4CNFDb2rBtD1vaFy')
            hmac.update(body.payment.razorpay_order_id+'|'+body.payment.razorpay_payment_id);
           hmac=hmac.digest('hex')
           if(hmac==body.payment.razorpay_signature){
            if(body.cart=='delete'){
                await cart.deleteOne({user_id:objectId(id)})
            }
            resolve()
            
           }else{
            reject()
           }
        })
    },
    changestatus:(orderId)=>{
        return new Promise(async(resolve,reject)=>{
            console.log('--------------------odersdfsf');
            console.log(orderId.order.data.response);
       await order.updateOne({_id:orderId.order.data.response.receipt},{$set:{payment:"success",online:'success'}})
       resolve()
        })
    },
    findCategory:(id)=>{
        return new Promise(async(resolve,reject)=>{
            try {
                const list=await add_product.find({category:id}).populate('category').lean()
                resolve(list)
            } catch (error) {
                reject(error)
            }
        })
    },
    view_more:()=>{
        return new Promise(async(resolve,reject)=>{
            try {
                const view=add_product.find().populate('category').lean()
                resolve(view)
            } catch (error) {
                reject(error)
            }
        })
    }

}