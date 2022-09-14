module.exports={


    adminlogin:(req,res,next)=>{

        if(req.session.adminlogin){
            next()
        }else{
            res.render('admin/admin_login',{adminloginError:req.session.adminloginError});
            req.session.adminloginError=false
        }
    },
    admindash:(req,res,next)=>{
        if(req.session.adminlogin){
            next()
        }else{
            res.redirect('/admin')
        }
    }

}