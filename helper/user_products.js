const get_product=require('../models/add_products')
const get_category=require('../models/add_category')
const wishlist=require('../models/wishlist_model')
var objectId=require('mongodb').ObjectId
const cart=require('../models/cart_model')
const coupon=require('../models/add_coupon')
module.exports={
    products_home:()=>{
        return new Promise(async(resolve,reject)=>{
        //    const category =await get_category.findOne({category:'latest'}).lean()
        //     id=category._id
        //     const products= await get_product.find({category:{_id:objectId(id)}}).lean()
        try {
            const products= await get_product.find().sort({createdAt:1}).limit(8).lean()
           resolve(products)
        } catch (error) {
            reject(error)
        }
        

        })
    },

    single_product:(id)=>{
        return new Promise(async(resolve,reject)=>{
            try {
                let coupon_exist = await coupon.find().lean()
                console.log('----------exist');
                console.log(coupon_exist);
                
                const product= await get_product.findOne({_id:objectId(id)}).populate('category').lean()
                product.coupon=coupon_exist

            resolve(product)
            } catch (error) {
                reject(error)
            }
            
        })
    },create_wishlist:(user_id,product_id)=>{
        return new Promise(async(resolve,reject)=>{
            var status=true
            try {
                
                const user=await wishlist.findOne({user_id:objectId(user_id)})
            console.log('----------rs--------------------------');
            console.log(user);
            if(user){
               const user_cart= await wishlist.findOne({user_id:objectId(user_id),list:{$elemMatch:{product:objectId(product_id)}}})
               console.log(user_cart);
            //    
               if(user_cart){
                console.log('working one');
               // await cart.updateOne({user_id:objectId(user_id),list:{$elemMatch:{product:objectId(product_id)}}},{$set:{"carts.$.color":body.color,"carts.$.size":body.size},$inc:{"carts.$.quantity":body.quantity}})
                status=false
                resolve(status)
               }else{
                console.log('working two');
                await wishlist.updateOne({user_id:objectId(user_id)},{$push:{list:{product:product_id}}})
                resolve(status)
               }
              
            }else{
                await wishlist.create({user_id:user_id,list:[{product:product_id}]})
                resolve(status)
            }
   
            } catch (error) {
                reject(error)
            }
        })
    },
    get_wishlist:(id)=>{
        return new Promise(async(resolve,reject)=>{
            try {
                
                 await wishlist.findOne({user_id:objectId(id)}).populate('list.product').lean().then((wish)=>{
                    resolve(wish)
                 })
                
                
            } catch (error) {
                reject(error)
            }
        })
      },
      delete_wishlist:(id,product_id)=>{
        console.log('------------id------------');
       console.log(product_id);

        return new Promise(async(resolve,reject)=>{
            try {
               await wishlist.updateOne({user_id:objectId(id),list:{$elemMatch:{product:objectId(product_id)}}},{$pull:{list:{product:objectId(product_id)}}})
                resolve()
            } catch (error) {
                reject(error)
            }
        })
      }, 
      delete_cart:(id,product_id)=>{
        console.log('------------id------------');
       console.log(product_id);

        return new Promise(async(resolve,reject)=>{
            try {
               await cart.updateOne({user_id:objectId(id),carts:{$elemMatch:{product:objectId(product_id)}}},{$pull:{carts:{product:objectId(product_id)}}})
                resolve()
            } catch (error) {
                reject(error)
            }
        })
      },

      
      count:(id)=>{
        return new Promise(async(resolve,reject)=>{
            var status={
                num:0,
                cart:0
                
            }
            try{
                var cartcnt= await cart.findOne({user_id:objectId(id)})
                var cnt=await wishlist.findOne({user_id:objectId(id)})
                if(cnt||cartcnt){
                    if(cnt){
                        console.log(cnt.list.length);
                        status.num=cnt.list.length
                        
                    }
                    if(cartcnt){
                        console.log(cartcnt.carts.length);
                        status.cart=cartcnt.carts.length
                    }
                    resolve(status)
                   
                }else{
                    resolve(status)
                }
                
            }catch (error) {
                reject(error)
            }
        })
      }

}
