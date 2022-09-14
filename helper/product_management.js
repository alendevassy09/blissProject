const db=require('../models/signup_Model')
const admins=require('../models/admin_Model')
const add_product=require('../models/add_products')
const add_category=require('../models/add_category')
const wishlist=require('../models/wishlist_model')

const cart=require('../models/cart_model')
var objectId=require('mongodb').ObjectId
var fs = require('fs');


module.exports={

    find_categories:()=>{
        return new Promise(async(resolve,reject)=>{
            try {
                const categories=await add_category.find().lean()
            resolve(categories)
            } catch (error) {
                reject(error)
            }
            
        })
        
    },
    add:(product)=>{
        console.log('this is products');
        console.log(product);
        
        return new Promise(async(resolve,reject)=>{
            try {
                await add_product.create(product).then(()=>{
                    resolve()
                })
                // .catch((err)=>{
                //     reject(err)
                // })
    
            } catch (error) {
                reject(error)
            }
           
        })

    },
    view_products:()=>{
        return new Promise(async(resolve,reject)=>{
            try {
                const products_from_db=await add_product.find().populate('category').sort({createdAt:1}).lean()
            console.log(products_from_db);
            
            resolve(products_from_db)
            } catch (error) {
                reject(error)
            }
            
        })
    },
    delete_products:(id)=>{
        return new Promise(async(resolve,reject)=>{
            try {
                await cart.updateMany({carts:{$elemMatch:{product:objectId(id)}}},{$pull:{carts:{product:id}}}).then((pro)=>{
                    console.log('---------------------------------------------------');
                    console.log(pro);
                    console.log('---------------------------------------------------');
                   
                })
                await wishlist.updateMany({list:{$elemMatch:{product:objectId(id)}}},{$pull:{list:{product:id}}}).then((pro)=>{
                    console.log('---------------------------------------------------');
                    console.log(pro);
                    console.log('---------------------------------------------------');
                   
                })
                const picture=await add_product.findOne({_id:objectId(id)})
                console.log("---------picture---------------");
                console.log(picture.pic.length);
                for(let i=0;i<picture.pic.length;i++){
                    fs.unlink('public/'+picture.pic[i], function (err) {
                        if (err) {
                            console.log("failed to delete local image:"+err);
                        } else {
                            console.log('successfully deleted local image');                                
                        }
                      });
                }
                await add_product.deleteOne({_id:objectId(id)}).then((data)=>{

                    resolve()
                })
                // .catch((err)=>{
                //     reject()
                // })
            } catch (error) {
                reject(error)
            }
            
        })
    },
    edit_products:(id)=>{
        

        return new Promise(async(resolve,reject)=>{
            try {
                const product= await add_product.findOne({_id:objectId(id)}).populate('category').lean()
                console.log(product);
                resolve(product)
                
                
            } catch (error) {
                reject(error)
            }
       
        })
    },
    update:(id,data)=>{
        return new Promise(async(resolve,reject)=>{
            try {
                if(data.pic==''){
                    await add_product.updateOne({_id:objectId(id)},{
                        $set:{
                            product_name:data.product_name,
                            price:data.price,
                            offerprice:data.offerprice,
                            stock:data.stock,
                            category:data.category,
                        }
                    }).then(()=>{
                        resolve()
                    })
                }else{
                    const picture=await add_product.findOne({_id:objectId(id)})
                    console.log("---------picture---------------");
                    console.log(picture.pic.length);
                    for(let i=0;i<picture.pic.length;i++){
                        fs.unlink('public/'+picture.pic[i], function (err) {
                            if (err) {
                                console.log("failed to delete local image:"+err);
                            } else {
                                console.log('successfully deleted local image');                                
                            }
                        });
                    }
                    await add_product.updateOne({_id:objectId(id)},{
                        $set:{
                            product_name:data.product_name,
                            price:data.price,
                            offerprice:data.offerprice,
                            stock:data.stock,
                            category:data.category,
                            pic:data.pic
                        }
                    }).then(()=>{
                        resolve()
                    })
              }
            } catch (error) {
                reject(error)
            }
            
            
        })
    },
    get_categories:()=>{
        return new Promise(async(resolve,reject)=>{
            try {
                const category = await add_category.find().lean()
          resolve(category)
            } catch (error) {
                reject(error)
            }
          
        })
    },

    edit_category:(id,data)=>{

        return new Promise(async(resolve,reject)=>{
            try {
                await add_category.updateOne({_id:objectId(id)},{
                $set:{
                    category:data.category
                }
            }).then(()=>{
                resolve()
            })
            } catch (error) {
                reject(error)
            }
           
        })
    },
    delete_category:(id)=>{
        return new Promise(async(resolve,reject)=>{
            try {
                const product = await add_product.findOne({category:id}) 
            console.log(product);
            const response={
                catExist:false
            }
            if(!product){
                await add_category.deleteOne({_id:objectId(id)}).then(()=>{
                    resolve(response)
                }).catch(()=>{
                    reject()
                })
            }else{
                response.catExist=true
                resolve(response)
            }
            } catch (error) {
                reject(error)
            }
            
           
        })
    },
    add_category:(category)=>{
        console.log(category.category);
        category.category=category.category.toLowerCase();
        let response={exist:false}
        return new Promise(async(resolve,reject)=>{
            try {
                const categories=await add_category.findOne(category)

                console.log(categories);
                if(categories){
                    response.exist=true
                    resolve(response)
                }else{
                    await add_category.create(category).then(()=>{
                        resolve(response)
                    })
                }
            } catch (error) {
                reject(error)
            }
           
        })

    }


}