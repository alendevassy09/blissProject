const db=require('../models/signup_Model')
const categories=require('../models/add_category')

module.exports={


    isblocked_check:(req,res,next)=>{
        if(req.session.login){
            new Promise(async(resolve,reject)=>{
            
                var user=await db.findOne({email:req.session.isblocked})
                req.session.user_id=user._id
                resolve(user)
            }).then((user)=>{
                console.log("this is for checking user is blocked ="+user);
                if(user.isblocked){
                    res.render('blocked',{layout:'blocked_layout'})
                }else{
                    next()
                }
            })
        }else{
            next() 
        }
      
    },
    userLoginCheck:(req,res,next)=>{
        if(!req.session.login){
            console.log('-------not login user');
            res.redirect('/login')
        }else{
            next()
        }

    },
    userLoginCheck_cart:(req,res,next)=>{
        if(!req.session.login){

            console.log('-------not login');
            res.redirect('/login')
        }else{
            next()
        }

    },
    category:async(req,res,next)=>{

            
                console.log('----------cat find');
               const list= await categories.find().lean()
               req.session.categories_from_database=list
                next()
         
    }

}