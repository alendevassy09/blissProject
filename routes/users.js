var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('blocked')
});
// router.get('/next',(req,res)=>{
//   res.render('blocked') 
// }) 


module.exports = router;
    