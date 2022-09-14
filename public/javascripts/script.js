
var num=0
export default {num}

 var maincount
 var cartcount
document.addEventListener('DOMContentLoaded',funon);
		function funon(){
			console.log('sdsdsdsdsdsdsd')
		axios({
							url: "/count",
							method: "get"
							})
							.then(function (response) {
								//handle success
								document.getElementById('wishcount').innerHTML=response.data.status.num
								document.getElementById('cartcount').innerHTML=response.data.status.cart
								console.log(response.data.status.num)
								console.log(response.data.status.cart)
								maincount=response.data.status.num
								cartcount=response.data.status.cart
							})
							.catch(function (response) { 
								//handle error
								console.log(response);
							});
            
		}


		var count=document.getElementById('wishcount').innerHTML

		function wishlist(product){
            
            
            console.log('-----------------------------')
                axios({
							method: "post",
							url: "/wishlist",
							data:{product_id:product}
							
							})
							.then(function (response) {
								//handle success
								console.log(count)
								console.log(response.data.status)
								if(response.data.status){
									document.getElementById('wishcount').innerHTML=1+maincount++
									swal({ 																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																						
								text: "added to wishlist ",
								icon: "success",
								 timer: 1000,
								 buttons: false
								});
								}else if(response.data.status==false){
									swal({ 																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																						
								text: "already in wishlist",
								icon: "success",
								 timer: 1000,
								 buttons: false
								});
								}else if(typeof(response.data.status)=='undefined'){
									swal({ 																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																						
								text: "please login",
								icon: "warning",
								 timer: 1000,
								 buttons: false
								});
								}


								
								
							})
							.catch(function (response) { 
								//handle error
								console.log(response);
							});
            
                    	
        }

	function addtocart(proId){
			let color= document.getElementById('color').value   
      		let size= document.getElementById('size').value  
			let qty= document.getElementById('sst').value  
        				console.log(qty)
						axios({
							method: "post",
							url: "/add-to-cart",
							data:{color:color,
							size:size,
							quantity:qty,
							product_id:proId},
							
							})
							.then(function (response) {
								console.log(response.data.status)
								if(response.data.status){
									document.getElementById('cartcount').innerHTML=1+cartcount++

									swal({ 																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																						
								text: "added to cart",
								icon: "success",
								 timer: 1000,
								 buttons: false
								});
								}else if(response.data.status==false){
									swal({ 																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																						
								text: "already in cart",
								icon: "success",
								 timer: 1000,
								 buttons: false
								});
								}else if(typeof(response.data.status)=='undefined'){
									swal({ 																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																						
								text: "please login",
								icon: "warning",
								 timer: 1000,
								 buttons: false
								});
								}
								
								//handle success
								//console.log(response);
								
							})
							.catch(function (response) {
								//handle error
								console.log(response);
							});
		}

function addtocartwish(proId){
			let color= document.getElementById('color').value   
      		let size= document.getElementById('size').value  
			let qty= document.getElementById('sst').value  
        				console.log(qty)
						axios({
							method: "post",
							url: "/add-to-cart",
							data:{color:color,
							size:size,
							quantity:qty,
							product_id:proId},
							
							})
							.then(function (response) {
								swal({ 																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																						
								text: "added to cart wish",
								icon: "success",
								 timer: 1000,
								 buttons: false
								});
								//handle success
								//console.log(response);
								
							})
							.catch(function (response) {
								//handle error
								console.log(response);
							});
		}
        
        function wishlist_remove(product){
            
            
            console.log('-----------------------------')
                axios({
							method: "post",
							url: "/wishlist_remove",
							data:{product_id:product}
							
							})
							.then(function (response) {
								//handle success
								location.reload()
							})
							.catch(function (response) { 
								//handle error
								console.log(response);
							});
            
        }

