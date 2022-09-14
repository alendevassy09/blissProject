var express = require('express');
var router = express.Router();
const adminHelper = require('../helper/adminhelper')
const admin_Middleware =require('../middlewares/adminmiddle')
const product_management = require('../helper/product_management')
const add_product_model=require('../models/add_products')
const multer =  require('multer')
const path= require('path');
var orderhelper= require('../helper/order')

const { response } = require('express');
const admin = require('../models/admin_Model');


//======================================================================================
const uploadbanner = multer({dest:'public/banners'})
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `files/admin-${file.fieldname}-${Date.now()}.${ext}`);
  },
});
const multerFilter = (req, file, cb) => {
  if (file.mimetype.split("/")[1] === "jpeg" || file.mimetype.split("/")[1] === "png" || file.mimetype.split("/")[1] === "jpg" || file.mimetype.split("/")[1] === "webp" || file.mimetype.split("/")[1] === "svg") {
    cb(null, true);
  } else {
    cb(new Error("Not a image File!!"), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});



//========================================================================================





router.get('/',admin_Middleware.adminlogin,function(req, res, next) {
  
  res.redirect('/admin/dashboard')
});



router.post('/admin_login', function(req, res, next) {
  console.log(req.body);
  adminHelper.adminLogin(req.body).then((response)=>{

    if(response.status){
      req.session.adminlogin=true
      res.redirect('/admin/dashboard');
    }else{
      req.session.adminloginError=true
      res.redirect('/admin')
    }
  }).catch((err)=>{
    res.render('error',{adminerror:true})
  })
});

router.get('/dashboard',admin_Middleware.admindash, function(req,res,next){
  // if(req.session.adminlogin){
    orderhelper.statitics().then((statitics)=>{
      res.render('admin/dashboard',{layout:'admin_layout',admin:true,statitics})
    }).catch((err)=>{
      next(err)
    })
    
  // }else{
    // res.redirect('/admin')
  // }
    
  });



  router.get('/users',function(req,res,next){
    if(req.session.adminlogin){
      adminHelper.getUsers().then((userData)=>{
      
        console.log(userData);
        res.render('admin/users',{layout:'admin_layout',admin:true,userData})
      }).catch((err)=>{
        res.render('error',{adminerror:true})
      })
    }else{
      res.redirect('/admin')
    }
  
    })

  router.get('/block/:id',(req,res,next)=>{
      var blockUserId=req.params.id
      adminHelper.blockUser(blockUserId).then((find)=>{
        console.log(find);
      }).catch((err)=>{
        res.render('error',{adminerror:true})
      })
    res.redirect('/admin/users')
  })

  router.get('/activate/:id',(req,res)=>{
    var activateId=req.params.id
    adminHelper.activateUser(activateId).then((find)=>{
      console.log(find);
    }).catch((err)=>{
      res.render('error',{adminerror:true})
    })
  res.redirect('/admin/users')
})

//add products ==================================================================

router.get('/add_products',admin_Middleware.admindash,(req,res)=>{
  product_management.find_categories().then((categories)=>{
    res.render('admin/add_product',{layout:'admin_layout',admin:true,categories})
  }).catch((err)=>{
    res.render('error',{adminerror:true})
  })
  // if(req.session.adminlogin){
    // res.render('admin/add_product',{layout:'admin_layout',admin:true})
  // }else{
  //   res.redirect('/admin')
  // }
})


router.post('/product_submission',upload.array('pic',3),(req,res)=>{
  console.log('------------------------------------------------');
  console.log(req.body);
  console.log('------------------------------------------------');

  console.log(req.files);
  const images = req.files
  let array = []
  array =  images.map((value)=> value.filename)
  console.log(array); 
  req.body.pic=array
  product_management.add(req.body).then(()=>{

    res.redirect('/admin/view_products')

  }).catch((err)=>{
    res.render('error',{adminerror:true})
  })
})
// routes related to add products ends here=======================================


//view products ==================================================================


router.get('/view_products',admin_Middleware.admindash,(req,res)=>{
  product_management.view_products().then((products_from_db)=>{
    res.render('admin/view_products',{layout:'admin_layout',admin:true,products_from_db})
  }).catch((err)=>{
    res.render('error',{adminerror:true})
  })
  

})

//view products ends here=========================================================
//delete products=================================================================

router.get('/delete/:id',admin_Middleware.admindash,(req,res)=>{
  id=req.params.id
  product_management.delete_products(id).then(()=>{
    res.redirect('/admin/view_products')
  }).catch((err)=>{
    res.render('error',{adminerror:true})
  })
})



//delete products ends here=======================================================


//edit products===================================================================

router.get('/edit/:id',admin_Middleware.admindash,async(req,res)=>{

  let category_list
  id=req.params.id
  // const categories= await product_management.find_categories().
  await product_management.find_categories().then((list)=>{
    category_list=list
  }).catch((err)=>{
    next(err)
  })
 await product_management.edit_products(id).then((product)=>{
    console.log(product);
    res.render('admin/edit_products',{layout:'admin_layout',admin:true,product,category_list})
  }).catch((err)=>{
    res.render('error',{adminerror:true})
  })
})

router.post('/edit_product/:id',upload.array('pic', ),(req,res)=>{

  console.log(req.files);
  const images = req.files
  let array = []
  array =  images.map((value)=> value.filename)
  console.log(array); 
  req.body.pic=array
  product_management.update(req.params.id,req.body).then(()=>{

    res.redirect('/admin/view_products')

  }).catch((err)=>{
    res.render('error',{adminerror:true})
  })

}) 
//edit products ends here===================================================================
//category==================================================================================

router.get('/category',admin_Middleware.admindash,(req,res)=>{
  product_management.get_categories().then((categories)=>{
    res.render('admin/view_category',{layout:'admin_layout',admin:true,categories,catExist:req.session.catExist,duplicate:req.session.category_exist})
    req.session.catExist=false
    req.session.category_exist=false
  }).catch((err)=>{
    res.render('error',{adminerror:true})
  })

  // res.render('admin/view_category',{layout:'admin_layout',admin:true})

})

router.post('/edit_category_name/:id',(req,res)=>{
const id = req.params.id
  product_management.edit_category(id,req.body).then(()=>{
    res.redirect('/admin/category')
  }).catch((err)=>{
    res.render('error',{adminerror:true})
  })
})

router.get('/delete_category/:id',admin_Middleware.admindash,(req,res)=>{
  id=req.params.id
  product_management.delete_category(id).then((response)=>{
    req.session.catExist=response.catExist
    res.redirect('/admin/category')
  }).catch((err)=>{
    res.render('error',{adminerror:true})
  })

})


// router.get('/add_category',admin_Middleware.admindash,(req,res)=>{

//   res.render('admin/add_category',{layout:'admin_layout',admin:true})
// })


router.post('/add_category',(req,res)=>{

  product_management.add_category(req.body).then((response)=>{

    if(response.exist){
      var exist=response.exist
      req.session.category_exist=exist
      // res.render('admin/add_category',{layout:'admin_layout',admin:true,exist})
      res.redirect('/admin/category')
    }else{
        res.redirect('/admin/category')
      }
    
      }).catch((err)=>{
        res.render('error',{adminerror:true})
      })
})

// router.get('/category_render',admin_Middleware.admindash,(req,res)=>{

//   res.render('admin/add_category',{layout:'admin_layout',admin:true,exist:req.session.category_exist})
//   req.session.category_exist=false;
  
// })

router.get('/orders',admin_Middleware.admindash,(req,res,next)=>{
  orderhelper.get_orders().then((orders)=>{
    res.render('admin/order_management',{layout:'admin_layout',admin:true,orders})
  }).catch((err)=>{
    res.render('error',{adminerror:true})
  })
})
router.get('/ship/:id',admin_Middleware.admindash,(req,res,next)=>{
  var id=req.params.id
  orderhelper.ship(id).then(()=>{
    res.redirect('/admin/orders')
  }).catch((err)=>{
    res.render('error',{adminerror:true})
  })
})

router.get('/delivered/:id',admin_Middleware.admindash,(req,res,next)=>{
  var id=req.params.id
  orderhelper.delivered(id).then(()=>{
    res.redirect('/admin/orders')
  }).catch((err)=>{
    res.render('error',{adminerror:true})
  })
})


router.get('/view_order_products/:id',admin_Middleware.admindash,(req,res,next)=>{
  var id=req.params.id
  orderhelper.view_order_products(id).then((orders)=>{
    res.render('admin/view_order',{layout:'admin_layout',admin:true,orders})
  }).catch((err)=>{
    res.render('error',{adminerror:true})
  })
})

router.get('/view_coupons',admin_Middleware.admindash,(req,res,next)=>{
  adminHelper.get_coupons().then((coupons)=>{
    res.render('admin/view_coupons',{layout:'admin_layout',admin:true,coupons})
  }).catch((err)=>{
    res.render('error',{adminerror:true})
  })
  
})

router.post('/add_coupon',admin_Middleware.admindash,(req,res,next)=>{
  adminHelper.add_coupon(req.body).then(()=>{
    res.redirect('/admin/view_coupons')
  }).catch((err)=>{
    res.render('error',{adminerror:true})
  })
})


router.post('/edit_coupon/:id',admin_Middleware.admindash,(req,res,next)=>{
  const id = req.params.id
  adminHelper.edit_coupon(id,req.body).then(()=>{
    res.redirect('/admin/view_coupons')
  }).catch((err)=>{
    res.render('error',{adminerror:true})
  })
})

router.get('/delete_coupon/:id',admin_Middleware.admindash,(req,res,next)=>{
  const id = req.params.id
  adminHelper.delete_coupon(id).then(()=>{
    res.redirect('/admin/view_coupons')
  }).catch((err)=>{
    res.render('error',{adminerror:true})
  })
})



router.get('/view_banner',admin_Middleware.admindash,(req,res,next)=>{
  adminHelper.get_banner().then((banner)=>{
    res.render('admin/view_banner',{layout:'admin_layout',admin:true,banner})
  }).catch((err)=>{
    res.render('error',{adminerror:true})
  })
  
})
router.post('/edit_banner/:id',upload.array("pic"),(req,res,next)=>{

  console.log(req.files);
  const images = req.files
  let array = []
  array =  images.map((value)=> value.filename)
  console.log(array); 
  req.body.pic=array[0]
  adminHelper.edit_banner(req.params.id,req.body).then(()=>{
    res.redirect('/admin/view_banner')
  }).catch((err)=>{
    res.render('error',{adminerror:true})
  })
})



router.post('/add_banner',upload.array("pic"),(req,res,next)=>{
  try{

   
console.log(req.files);
const images = req.files
let array = []
array =  images.map((value)=> value.filename)
console.log(array); 
req.body.pic=array[0]
  adminHelper.add_banner(req.body).then(()=>{
    res.redirect('/admin/view_banner')
  }).catch((err)=>{
    res.render('error',{adminerror:true})
  })

  }catch(err){
    res.render('error',{adminerror:true})
  }

})


router.get('/getdash',(req,res)=>{
  orderhelper.stati().then((stat)=>{
    res.json({stat})
  }).catch((err)=>{
    res.render('error',{adminerror:true})
  })
})
router.get('/admin_logout',function(req,res,next){
  
  req.session.adminlogin=false
  res.redirect('/admin')
  })





module.exports = router;
 









//for safety

/* GET users listing. */
// router.get('/', function(req, res, next) {
//   if(req.session.adminlogin){
//     res.redirect('/admin/dashboard')
//   }else{
//     res.render('admin/admin_login',{adminloginError:req.session.adminloginError});
//     req.session.adminloginError=false
//   }
  
// });