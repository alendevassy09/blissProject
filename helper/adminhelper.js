const db=require('../models/signup_Model')
const admins=require('../models/admin_Model')
const coupon=require('../models/add_coupon')
const banner=require('../models/add_banner')
const bcrypt= require('bcrypt')
var objectId=require('mongodb').ObjectId
module.exports={


    adminLogin:(loginDetails)=>{
        
        let response={}
    return new Promise(async(resolve,reject)=>{
        try{
            let admin_data = await admins.findOne({email:loginDetails.email})
      console.log('this is user');
      console.log(admin_data);
      if(admin_data){
        bcrypt.compare(loginDetails.password,admin_data.password).then((status)=>{
            if(status){
                console.log('login success');
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
            
        }catch(err){
            reject(err)
        }
      
    })
    },

    getUsers:()=>{

        return new Promise(async(resolve,reject)=>{
            try {
                let usersFromDatabase=await db.find().lean()
                console.log(usersFromDatabase);
                
                resolve(usersFromDatabase)
            } catch (error) {
                reject(error)
            }
           
        })

    },
    
    blockUser:(userID)=>{
        return new Promise(async(resolve,reject)=>{
            try {
                var find=await db.findById({_id:objectId(userID)})
            console.log(find.isblocked);
            find.isblocked=true
           
           await db.updateOne({_id:objectId(userID)},find)
           resolve("collected")
                
            } catch (error) {
                reject(error)
            }
            
        })

    },
    activateUser:(userID)=>{
        return new Promise(async(resolve,reject)=>{
            try {
                var find=await db.findById({_id:objectId(userID)})
            console.log(find.isblocked);
            find.isblocked=false
           
           await db.updateOne({_id:objectId(userID)},find)
           resolve("activation collected")
                
            } catch (error) {
                reject(error)
            }
            
        })
    },
    get_coupons:()=>{

        return new Promise(async(resolve,reject)=>{
            try {
               let coupon_details  = await coupon.find().lean()
               resolve(coupon_details)

            } catch (error) {
                reject(error)
            }
        })

    },
    add_coupon:(body)=>{

        return new Promise(async(resolve,reject)=>{
            try{
                var val = Math.floor(10000 + Math.random() * 90000);

                body.couponCode=body.couponCode+'-'+val
              await coupon.create(body) 
              resolve()
            } catch (error) {
                reject(error)
            }
        })

    },
    edit_coupon:(id,body)=>{

        return new Promise(async(resolve,reject)=>{
            try{
              await coupon.updateOne({_id:objectId(id)},{$set:{coupon:body.coupon,couponCode:body.couponCode,discount:body.discount}}) 
              resolve()
            } catch (error) {
                reject(error)
            }
        })

    },
    delete_coupon:(id)=>{

        return new Promise(async(resolve,reject)=>{
            try{
              await coupon.deleteOne({_id:objectId(id)}) 
              resolve()
            } catch (error) {
                reject(error)
            }
        })

    },
    add_banner:(body)=>{
        return new Promise(async(resolve,reject)=>{
            try{
                await banner.create(body)
                resolve()
            }catch(err){
                reject(err)
            }
           
        })
    },
    get_banner:()=>{
        return new Promise(async(resolve,reject)=>{
            try {
              let bannerget = await banner.find().lean()
              resolve(bannerget)
            } catch (error) {
                reject(error)
            }
        })
    },
    edit_banner:(id,body)=>{
        return new Promise(async(resolve,reject)=>{
            try{
                await banner.updateOne({_id:id},{$set:{
                    title:body.title,
                    description:body.description,
                    pic:body.pic
                }})
                resolve()

            }catch(error){
                reject(error)
            }
           

        })
    }

} 