
const db=require('../models/signup_Model')
const cart=require('../models/cart_model')
const order= require('../models/order_model')
const user = require('../models/signup_Model')
const coupon = require('../models/add_coupon')
const category=require('../models/add_category')
const product_qty_dec=require('../models/add_products')
// const { EsimProfileContext } = require('twilio/lib/rest/supersim/v1/esimProfile')
// const { category } = require('../middlewares/usermiddle')
var objectId=require('mongodb').ObjectId


module.exports={
    checkout:(userid,body,coupon_code)=>{
        return new Promise(async(resolve,reject)=>{
          
          try {
            let coupon_used
            if(coupon_code){
              await coupon.updateOne({couponCode:coupon_code},{$push:{users_list:{user:objectId(userid)}}})
              console.log('----------exist');
               coupon_used = await coupon.findOne({couponCode:coupon_code})
               body.coupon_name=coupon_used.coupon
               body.coupon_discount=coupon_used.discount
               

            }
             console.log('---body');
            console.log(body.products);


            const user_cart = await cart.findOne({user_id:objectId(userid)})
          // console.log(user_cart);
          // const user_order=await order.findOne({user_id:userid})
          // console.log(user_order);

          var contents=[]
            for(let i=0;i<user_cart.carts.length;i++){
                console.log(user_cart.carts[i]);
                contents[i]=user_cart.carts[i]

              }

            //    await order.create({user_id:userid,method:'cod',products:contents})
            var date=new Date()
            var newdate=date.toISOString()
            newdate=newdate.slice(0,10)
            body.user_id=userid,
            body.products=contents
            body.checkDate=newdate
            body.payment='pending'
            
            if(body.method!='COD'){
              body.online='failed'
              for(let i=0;i<body.products.length;i++){
                await product_qty_dec.updateOne({_id:body.products[i].product},{$inc:{stock:-body.products[i].quantity}})
              }
            }else{
              body.online='',
              await cart.deleteOne({user_id:objectId(userid)})
              for(let i=0;i<body.products.length;i++){
                await product_qty_dec.updateOne({_id:body.products[i].product},{$inc:{stock:-body.products[i].quantity}})
              }

            }
            
            await order.create(body).then(async(response)=>{
              // await cart.deleteOne({user_id:objectId(userid)})
              console.log('-----------response');
              console.log(response);
               resolve(response._id)
            })
              
          
        //   if (!user_order) {
            
        //   }else{
        //     var contents=[]
        //     for(let i=0;i<user_cart.carts.length;i++){
        //         console.log(user_cart.carts[i]);
        //         contents[i]=user_cart.carts[i]
        //         await order.updateOne({user_id:userid},{$push:{products:contents[i]}})
        //       }
            
        //   resolve()
        //   }
          } catch (error) {
            reject(error)
          }
          
        })
    },
    orders:(_id)=>{
        return new Promise(async(resolve,reject)=>{
           try {
            var totalprice=0
            var qty=0
           const orders = await order.find({user_id:objectId(_id),online:{$ne:'failed'}}).populate('products.product').sort({createdAt:-1}).lean()
           
       console.log('-------------------------------');
       resolve(orders)
           let total=[]
      // if(orders[0]!=null){
      //   for(let k=0;k<orders.length;k++){


      //     for(let i=0;i<orders[k].products.length;i++){
      //       // console.log(products.carts[i].product.offerprice);
      //       totalprice=totalprice+orders[k].products[i].product.offerprice
            
      //       qty=qty+orders[k].products[i].quantity
      //       total[i]=totalprice*qty
      //       totalprice=0
      //       qty=0
      //           }
  
      //             for(let i=0;i<total.length;i++){
      //               totalprice=totalprice+total[i]
      //         }
      //     orders[k].totalprice=totalprice
      //     totalprice=0
      //     qty=0
      //     resolve(orders)
  


      //   }
       
      //   }else{
      //     console.log('-------------------------------');
      //         console.log(orders);    
      //     console.log('-------------------------------');
      //     resolve(orders)
      //   }
           
           
           } catch (error) {
            reject(error)
           }
          
        })
        
    },
    get_detailed_view:(id)=>{
      return new Promise(async(resolve,reject)=>{
        try{
          const from_orders = await order.findOne({_id:objectId(id)}).populate('products.product').lean()
          resolve(from_orders)
        }catch(err){
          reject(err)
        }
      })
    },
    get_orders:()=>{
      return new Promise(async(resolve,reject)=>{
        try {
           await order.find({online:{$ne:'failed'}}).populate('products.product').sort({createdAt:-1}).lean().then((orders)=>{
            resolve(orders)
           })
          
        } catch (error) {
          reject(error)
        }
      })
    },
    ship:(id)=>{
      return new Promise(async(resolve,reject)=>{
        try{
          await order.updateOne({_id:objectId(id)},{$set:{status:'shipped'}})
          resolve()
        }catch(error){
          reject(error)
        }
      })
    },
    delivered:(id)=>{
      return new Promise(async(resolve,reject)=>{
        try{
          await order.updateOne({_id:objectId(id)},{$set:{status:'delivered'}})
          resolve()
        }catch(error){
          reject(error)
        }
      })
    },
    view_order_products:(id)=>{
      return new Promise(async(resolve,reject)=>{
        try {
          console.log('----------------------');
          var order_products= await order.findOne({_id:objectId(id)}).populate('products.product').lean()
          console.log(order_products);
          resolve(order_products)
        } catch (error) {
          reject(error)
        }
      })
    },
    cancel_order:(id)=>{
      return new Promise(async(resolve,reject)=>{
        try {
          await order.updateOne({_id:id},{$set:{status:'canceled'}})
          resolve()
        } catch (error) {
          reject(error)
        }
      })
    },
    single_checkout:(userid,body,product,coupon_code)=>{
      return new Promise(async(resolve,reject)=>{
        try {
          let coupon_used
          if(coupon_code){

            await coupon.updateOne({couponCode:coupon_code},{$push:{users_list:{user:objectId(userid)}}})
            console.log('----------exist');  
            coupon_used = await coupon.findOne({couponCode:coupon_code})
               body.coupon_name=coupon_used.coupon
               body.coupon_discount=coupon_used.discount      
            }
          var contents=[]
         
          product.product=product.product_id
              contents[0]=product
              var date=new Date()
              var newdate=date.toISOString()
              newdate=newdate.slice(0,10)

            body.user_id=userid,
            body.products=contents
            body.checkDate=newdate
            // body.total=product.total
            body.payment='pending'
            if(body.method!='COD'){
              body.online='failed'
            }else{
              body.online=''
            }
            
            console.log(body);
            await order.create(body).then((response)=>{
              resolve(response._id)
            })
               
        
        } catch (error) {
          reject(error)
        }
       
      })
  },
  getAddress:(id)=>{
    return new Promise(async(resolve,reject)=>{
    try{
      let address = await order.findOne({user_id:objectId(id)}).sort({createdAt:-1}).lean()
      console.log('------address')
      console.log(address);
      resolve(address)
    }catch(error){
      reject(error)
    }
    })
  },
  statitics:()=>{
    return new Promise(async(resolve,reject)=>{
      try {
        var date=new Date()
        var newdate=date.toISOString()
        newdate=newdate.slice(0,10)
        var total_users =await user.find().count(1)
        var stat=await order.find({checkDate:newdate}).populate('products.product').lean()
        let categories=await category.find().lean()
          let cat_count=[]
          let count;
        
        var total_order = stat.length
        var canceled_order=0
        var pending_order=0
        var shipped_order=0
        var delivered_order=0
        var income =0
        var profit=0
        var failed=0
        var unit_sold=0
        var online_payment=0
        var cod=0
        var online=0
        for(let i=0;i<categories.length;i++){
          count=0
          cat_count[i]=categories[i]._id
        }
        for(let i=0;i<stat.length;i++){
          
          if(stat[i].method=='cod'){
            cod++
          }else{
            online_payment++
          }

        
        if(stat[i].online!='failed'){
          if(stat[i].status=='canceled'){
          canceled_order++
        }
          if(stat[i].status=='pending'){
          pending_order++
        }
          if(stat[i].status=='shipped'){
          shipped_order++
        }
        if(stat[i].status=='delivered'){
          delivered_order++
        }
      }


          if(stat[i].online!='failed' && stat[i].status!='canceled'){
            income=income + parseInt(stat[i].total) 
          }
          
          for(let j=0;j<stat[i].products.length;j++){
           unit_sold = unit_sold + stat[i].products[j].quantity
          }
        
          if(stat[i].online=='failed'){
            online++
          }
          
         
          
        }
        console.log(cat_count);
        var statitics={
          total_users:total_users,
          total_order:total_order,
          canceled_order:canceled_order,
          pending_order:pending_order,
          delivered_order:delivered_order,
          shipped_order:shipped_order,
          unit_sold:unit_sold,
          cod:cod,
          online_payment:online_payment,
          income:income,
          profit:profit,
          online:online,
          cat_count:cat_count
          
        }
        console.log(statitics);
        resolve(statitics) 

      } catch (error) {
        reject(error)
      }
    })
  },
  stati:()=>{
    return new Promise(async(resolve,reject)=>{
      try {
        var pending=0
        var delivered=0
        var canceled=0
        var shipped=0
        const orders= await order.find().lean()
        for(let i=0;i<orders.length;i++){
          if(orders[i].status=='pending'){
            pending++
          }
          if(orders[i].status=='delivered'){
            delivered++
          }
          if(orders[i].status=='shipped'){
            shipped++
          }
          if(orders[i].status=='canceled'){
            canceled++
          }
        }
   
      var dateArray=[]
        for(let i=0;i<5;i++){

          var d = new Date();

        d.setDate(d.getDate() - i);

        var newdate=d.toISOString()
        
        newdate=newdate.slice(0,10)
        
        console.log(newdate);   
        
        dateArray[i]=newdate
        }
        var dateSale=[]
        console.log(dateArray);
        for(let i=0;i<5;i++){
          dateSale[i]=await order.find({checkDate:dateArray[i]}).lean().count()
        }
console.log(dateSale);
        var status={
          pending:pending,
          delivered:delivered,
          shipped:shipped,
          canceled:canceled,
          dateSale:dateSale,
          dateArray:dateArray
        }
        
      resolve(status)
      } catch (error) {   
        reject(error)
      }

    })

    
  }
 

}

