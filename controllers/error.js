exports.get404=(req,res,next)=>{
    console.log('404 Error');
    res.status(404).render('404',{pageTitle:'Page Not Found',path:'/404'});
};