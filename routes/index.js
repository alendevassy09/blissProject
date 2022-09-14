var express = require("express");   
var router = express.Router();
require('dotenv').config()
const axios = require('axios').create({baseUrl: "https://jsonplaceholder.typicode.com/"});

var orderhelper= require('../helper/order')
var usermiddle = require("../middlewares/usermiddle");
var user_products=require('../helper/user_products')
const userHelper = require("../helper/userhelper");
const { response, json } = require("express");
const cart=require('../helper/user_cart_products');
const user_cart_products = require("../helper/user_cart_products");
const { render } = require("../app");
const order = require("../helper/order");
const adminhelper = require("../helper/adminhelper");
const accountSid=process.env.ACCOUNT_SID // otp account sid
const authToken = process.env.AUTH_TOKEN // otp auth token
const client = require("twilio")(accountSid, authToken);
const serviceId=process.env.SID//otp sid

const Razorpay = require('razorpay');

var instance = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET
});





/* GET home page. */
router.get("/", usermiddle.isblocked_check,usermiddle.category,function (req, res, next) {
  user_products.products_home().then((products)=>{
    adminhelper.get_banner().then((banner)=>{
      res.render("user/index", { login: req.session.login, user: true,products,banner,category:req.session.categories_from_database});
    }).catch((err)=>{
      next(err)
    })
  }).catch((err)=>{
    next(err)
  })
});

router.get("/login", function (req, res, next) {
  if (!req.session.login) {
    res.render("user/login", {
      loginError: req.session.loginError,
      user: true,
    });
    req.session.loginError = false;
  } else {
    res.redirect("/");
  }
});

router.post("/login", function (req, res, next) {
  userHelper
    .userLogin(req.body)
    .then((response) => {
      if (response.status) {
        console.log("this is a test =" + response.isblocked);
        req.session.isblocked = response.isblocked;
        req.session.user_id=response.user_id;
        req.session.login = true;
        res.redirect("/");
      } else {
        req.session.loginError = true;
        res.redirect("/login");
      }
    })
    .catch((err)=>{
      next(err)
    })
});

router.get("/create_Account", function (req, res, next) {
  if (!req.session.login) {
    res.render("user/signup", {
      userExist: req.session.userExist,
      exist: req.session.exist,
      user: true,
    });
    check = req.session.exist;
    console.log(check);
    req.session.exist = null;
    req.session.userExist = false;
  } else {
    res.redirect("/");
  }
});

router.post("/send_otp", function (req, res, next) {
  const {phone} = req.body;
  userHelper.userSignup(req.body).then((response) => {
    if (response.userExist) {
      console.log("yes exist");
      req.session.exist = req.body;
      req.session.userExist = true;
      res.redirect("/create_Account");
    } else {
      console.log(phone);
      client.verify.v2.services(serviceId)
      .verifications
      .create({to: '+91'+phone, channel: 'sms'})
      .then(verification => console.log(verification.status));

      req.session.data = req.body;
      if (!req.session.login) {
        // res.render("user/verification", { phone });
        req.session.phone=phone
        res.redirect('/enter_otp');
      } else {
        res.redirect("/");
      }
    }
  }).catch((err)=>{
    next(err)
  })
});

router.get("/enter_otp", (req, res) => {
  if(!req.session.login){

  res.render("user/verification",{phone:req.session.phone,wrong_otp:req.session.wrong_otp});
  req.session.wrong_otp=false
  }else{
    res.redirect('/')
  }
});

router.post("/verification", function (req, res, next) {
  let body = req.session.data;

  const { phone, otp } = req.body;
  client.verify.v2
    .services(serviceId)
    .verificationChecks.create({ to: "+91" + phone, code: otp })
    .then((verification_check) => {
      console.log(verification_check.status);
      if (verification_check.status == "approved") {
        userHelper.verification(body).then(() => {
          console.log("this is data");
          console.log(body);     
          req.session.login = true;
          req.session.isblocked = body.email;
          
          res.redirect("/");
        });
      } else {
        req.session.wrong_otp=true
        res.redirect("/enter_otp");
      }
    });
});

router.get("/forgot_Password", (req, res) => {
  if (!req.session.login)
    res.render("user/forgot_Pass", {
      forgot_Password_Check: req.session.forgot_Password_Check,
      wrong_otp_for_forgot_password: req.session.wrong_otp_for_forgot_password,
    });
  req.session.forgot_Password_Check = false;
  req.session.wrong_otp_for_forgot_password = false;
});

router.post("/forgot_email", (req, res, next) => {
  userHelper.forgot_Password(req.body).then((response) => {
    if (response.forgot_email) {
      const { phone } = response;
      client.verify.v2
        .services(serviceId)
        .verifications.create({ to: "+91" + phone, channel: "sms" })
        .then((verification) => console.log(verification.status));
      if (!req.session.login) {
        req.session.isblocked = response.isblocked;
        res.render("user/forgot_verification", { phone });
      } else {
        res.redirect("/");
      }
    } else {
      req.session.forgot_Password_Check = true;
      res.redirect("/forgot_Password");
    }
  }).catch((err)=>{
    next(err)
  })
});

router.post("/forgot_verification", function (req, res, next) {
  const { phone, otp } = req.body;
  client.verify.v2
    .services(serviceId)
    .verificationChecks.create({ to: "+91" + phone, code: otp })
    .then((verification_check) => {
      console.log(verification_check.status);
      if (verification_check.status == "approved") {
        req.session.login = true;
        res.redirect("/");
      } else {
        req.session.wrong_otp_for_forgot_password = true;
        res.redirect("/forgot_Password");
      }
    });
});

router.post('/add-to-cart',usermiddle.userLoginCheck_cart,usermiddle.isblocked_check,(req,res,next)=>{
  
  const product_id = req.body.product_id
  const user_id=req.session.user_id
  var body=req.session.isblocked
  console.log('----------------------------------');
  console.log(req.body);
  req.body.quantity=parseInt(req.body.quantity)
  cart.add_to_cart(product_id,user_id,req.body).then((status)=>{
    // res.redirect('/single_product_details')
    res.json({status})
    
  }).catch((err)=>{
    next(err)
  })
})

let product_id
router.get('/single_product_details/:id',(req,res,next)=>{
    product_id = req.params.id 
    user_products.single_product(product_id).then((product)=>{
      // console.log(product.product_name);
      res.render('user/single_product_details',{login: req.session.login,user:true,product})
    }).catch((err)=>{
      next(err)
    })
    // res.redirect('/single_product_details') 
})


// single product with login-----------------------------------------------------------------------
router.get('/single_product_details',usermiddle.userLoginCheck_cart,usermiddle.isblocked_check,(req,res,next)=>{
 
  user_products.single_product(product_id).then((product)=>{
    // console.log(product.product_name);
    res.render('user/single_product_details',{login: req.session.login,user:true,product})
  }).catch((err)=>{
    next(err)
  })
   
})  
router.get('/cart',usermiddle.userLoginCheck_cart,usermiddle.isblocked_check,(req,res,next)=>{
  var user_id=req.session.user_id 
  cart.show_cart(user_id).then((products)=>{ 
    console.log(products);
if(products==null){
  res.render('user/cart',{login: req.session.login,user:true,products,empty:true})
}
else if(products.carts[0]==null){
  res.render('user/cart',{login: req.session.login,user:true,products,empty:true})
}else{
  res.render('user/cart',{login: req.session.login,user:true,products})
}
    
  }).catch((err)=>{
    next(err)
  })
  
})

router.get("/home",(req, res) => {
  res.render('user/sample') 

});


router.post("/cart",usermiddle.userLoginCheck_cart,usermiddle.isblocked_check,(req,res,next) => {
  
  console.log(req.body);
  console.log('-----------------------------------');
  user_cart_products.inc_qty(req.body).then((response)=>{

    res.json(response)

  }).catch((err)=>{
    next(err)
  })
});

router.post("/cart_dec",usermiddle.userLoginCheck_cart,usermiddle.isblocked_check,(req,res,next) => {
  
  console.log(req.body);
  console.log('-----------------------------------');
  user_cart_products.dec_qty(req.body).then((response)=>{
    res.json(response)

  }).catch((err)=>{
    next(err)
  })
});

router.post('/checkout/:id',usermiddle.userLoginCheck_cart,usermiddle.isblocked_check,(req,res,next)=>{
  console.log('----------------this is checkout');
    console.log(req.body);
    const id =req.params.id
    
      orderhelper.checkout(id,req.body,req.session.coupon_code).then((orderId)=>{
        if(req.body.method=='COD'){
          res.json({codsuccess:true})
        }else{
          userHelper.generateRazorpay(orderId,req.body.total).then((response)=>{
            res.json({response})
          })
        }
        // res.render('user/success')
        
      }).catch((err)=>{
        next(err)
      })
      


})

router.post('/verify_payment',(req,res,next)=>{
  console.log(req.body);
  let id=req.session.user_id
  userHelper.verifyPayment(req.body,id).then(()=>{
    userHelper.changestatus(req.body).then(()=>{
      console.log('payment success');
      res.json({status:true})
    }).catch((err)=>{
      res.json({status:'payment failed'})
    })
   
  })
})

router.get('/checkout',usermiddle.userLoginCheck_cart,usermiddle.isblocked_check,(req,res,next)=>{
  var user_id=req.session.user_id 
  cart.show_cart(user_id).then((products)=>{
    
    order.getAddress(req.session.user_id).then((address)=>{

      userHelper.getAddress(req.session.user_id).then((add_list)=>{

        res.render('user/checkout',{login: req.session.login,products,address,add_list})
      }).catch((err)=>{
        next(err)
      })

    }).catch((err)=>{
      next(err)
    })
    
  }).catch((err)=>{
    next(err)
  })
  
})

router.get('/orders',usermiddle.userLoginCheck_cart,usermiddle.isblocked_check,(req,res,next)=>{
  var user_id=req.session.user_id 
  orderhelper.orders(user_id).then((products)=>{
    if(products[0]==null){
      res.render('user/orders',{login: req.session.login,user:true,products,empty:true})
    }else{
      console.log(products); 
      res.render('user/orders',{login: req.session.login,user:true,products})
    }
    
  }).catch((err)=>{
    next(err)
  })
})

router.get('/orders_view/:id',usermiddle.userLoginCheck_cart,usermiddle.isblocked_check,(req,res,next)=>{
  var order=req.params.id
  orderhelper.get_detailed_view(order).then((products)=>{
    console.log(products);
    res.render('user/view_ordered_products',{login: req.session.login,user:true,products})
  }).catch((err)=>{
    next(err)
  })
})
 router.get('/cancel_order/:id',(req,res,next)=>{
  var id = req.params.id
  orderhelper.cancel_order(id).then(()=>{
    res.json({response})
  }).catch((err)=>{
    next(err)
  })
 })

router.post('/buynow',(req,res,next)=>{
  console.log(req.body);
  req.session.single_product=req.body
  res.json({response})
})

router.get('/single_checkout',usermiddle.userLoginCheck_cart,usermiddle.isblocked_check,(req,res,next)=>{
  console.log('-------------------------------------------------------------');

req.session.single_product.user_id=req.session.user_id 
 var qty=req.session.single_product.quantity
const id = req.session.single_product.product_id
  user_products.single_product(id).then((product_name)=>{
    console.log('=====product_name');
    console.log(product_name);
    const total=qty*product_name.offerprice
     req.session.single_product.total=total

     order.getAddress(req.session.user_id).then((address)=>{

      userHelper.getAddress(req.session.user_id).then((add_list)=>{

        res.render('user/checkout_single',{login: req.session.login,products:req.session.single_product,product_name,address,add_list})
      }).catch((err)=>{
        next(err)
      })

    }).catch((err)=>{
      next(err)
    })

    
  }).catch((err)=>{
    next(err)
  })
  
  router.post('/single_checkout',usermiddle.userLoginCheck_cart,usermiddle.isblocked_check,(req,res,next)=>{
    console.log('-----------------------total');
    console.log(req.body);
    console.log('-----------------------total');
    const id =req.session.user_id
    
      orderhelper.single_checkout(id,req.body,req.session.single_product,req.session.coupon_code).then((orderId)=>{
        if (req.body.method=="COD") {
          res.json({codsuccess:true})
        }else{
          userHelper.generateRazorpay(orderId,req.body.total).then((response)=>{
            res.json({response})
          })
        }
        
      }).catch((err)=>{
        next(err)
      })
    
  })

})

router.post('/wishlist',usermiddle.userLoginCheck_cart,usermiddle.isblocked_check,(req,res,next)=>{
  var id=req.session.user_id
  var product_id=req.body.product_id
  console.log('here----------- ----------------------------------'); 
  console.log(req.body);
  if(id){
    user_products.create_wishlist(id,product_id).then((status)=>{
      res.json({status})
      }).catch((err)=>{
        next(err)
      }) 
  }else{
    res.json({response}) 
  }
  
})

router.get('/wishlist_view',usermiddle.userLoginCheck_cart,usermiddle.isblocked_check,(req,res,next)=>{
var user_id=req.session.user_id
  user_products.get_wishlist(user_id).then((products)=>{
    console.log('-----------------wish-----------------');
    //console.log(products.list);
    if (products!=null) {
      if(products.list[0]==null){
        console.log('yes null');
          res.render('user/wishlist',{login: req.session.login,user:true,products,empty:true})
        }else{
          console.log('not null');
          res.render('user/wishlist',{login: req.session.login,user:true,products})
        }
     }
     else{
          res.render('user/wishlist',{login: req.session.login,user:true,products,empty:true})
    }
    
    
  }).catch((err)=>{
    next(err)
  })
  })

  router.post('/wishlist_remove',usermiddle.userLoginCheck_cart,usermiddle.isblocked_check,(req,res,next)=>{
    var user_id=req.session.user_id
    var product_id=req.body.product_id
    user_products.delete_wishlist(user_id,product_id).then(()=>{
      res.json(response)
    }).catch((err)=>{
      next(err)
    })
  }) 


  router.post('/remove_from_cart',usermiddle.userLoginCheck_cart,usermiddle.isblocked_check,(req,res,next)=>{
    var user_id=req.session.user_id
    var product_id=req.body.product_id
    user_products.delete_cart(user_id,product_id).then(()=>{
      res.json(response)
    }).catch((err)=>{
      next(err)
    })
  })

  router.get('/count',usermiddle.userLoginCheck_cart,usermiddle.isblocked_check,(req,res,next)=>{
    var user_id=req.session.user_id
    user_products.count(user_id).then((status)=>{
      console.log(status);
      res.json({status})
    }).catch((err)=>{
      next(err)
    })
    
  })

  router.post('/use_coupon',(req,res,next)=>{
    console.log('coupon');
    console.log(req.body.coupon_id)
    req.session.coupon_code=req.body.coupon_id
    let user_id=req.session.user_id
    userHelper.have_used(user_id,req.body.coupon_id).then((status)=>{
      res.json({status})
    }).catch((err)=>{
      next(err)
    })
    
  })
  
  router.get('/profile',usermiddle.userLoginCheck_cart,usermiddle.isblocked_check,async(req,res,next)=>{
    let user_id=req.session.user_id
    await userHelper.getUserProfile(user_id).then(async(details)=>{
      console.log('-----details');
      console.log(details);
      await userHelper.getAddress(req.session.user_id).then((add)=>{
        res.render('user/profile',{login:req.session.login,user:true,details,add})
      }).catch((err)=>{
        next(err)
      })
      
    }).catch((err)=>{
      next(err)
    })
    
    
  })

  router.post('/edit_profile',usermiddle.userLoginCheck_cart,usermiddle.isblocked_check,(req,res,next)=>{
    console.log('---------profie');
    console.log(req.body);
   
    userHelper.edit_profile(req.session.user_id,req.body).then(()=>{
      res.json({response})
    }).catch((err)=>{
      next(err)
    })
  })


  router.post('/add_address',usermiddle.userLoginCheck_cart,usermiddle.isblocked_check,(req,res,next)=>{
    console.log(req.body);
  userHelper.add_address(req.session.user_id,req.body).then(()=>{
    res.json({response})
  }).catch((err)=>{
    next(err)
  })
    
  })

  router.post('/delete_add',usermiddle.userLoginCheck_cart,usermiddle.isblocked_check,(req,res,next)=>{
    userHelper.delete_add(req.body).then(()=>{
      res.json({response})
    }).catch((error)=>{
      next(error)
    })
  })

  
  router.post('/get_address_to_checkout/:id',(req,res,next)=>{
  console.log(req.params.id);
    userHelper.setAddress(req.params.id).then((set_add)=>{
      res.json({set_add})
    }).catch((err)=>{
      next(err)
    })
  })

  router.get('/category/:id',usermiddle.isblocked_check,usermiddle.category,(req,res,next)=>{
    var cat_id=req.params.id
    userHelper.findCategory(cat_id).then((category_name)=>{
      res.render('user/category',{login:req.session.login,user:true,category_name,category:req.session.categories_from_database})
    })
    
  })
  router.get('/view_more',usermiddle.category,(req,res,next)=>{
    userHelper.view_more().then((category_name)=>{
      res.render('user/category',{category_name,user:true,login:req.session.login,more:true,category:req.session.categories_from_database})
    }).catch((err)=>{
      next(err)
    })
  })


router.get('/sample',(req,res,next)=>{

  res.render('user/sample')
})
router.get('/success',(req,res,next)=>{
  res.render('user/success')
})


router.post('/sample/:id',(req,res,next)=>{
  
  console.log(req.body)
})



router.get('/logout',(req,res)=>{
  req.session.login = false;
  console.log(req.session);
  res.redirect('/')
})


module.exports = router;
 