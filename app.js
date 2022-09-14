var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var session = require('express-session')
var logger = require('morgan');
const hbs = require('express-handlebars');
const db = require('./config/connection')
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin')
const formidable = require('express-formidable');
// app.use(formidable());
var hbss = require('hbs');
var app = express();

// view engine setup 
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',hbs.engine({extname:'hbs',defaultLayout:'layout',layoutDir:__dirname+'/view/layout/',partialsDir:__dirname+'/views/partials/',
helpers:{
  eq: function (v1, v2) { return v1 === v2; },
    ne: function (v1, v2) { return v1 !== v2; },
    lt: function (v1, v2) { return v1 < v2; },
    gt: function (v1, v2) { return v1 > v2; },
    lte: function (v1, v2) { return v1 <= v2; },
    gte: function (v1, v2) { return v1 >= v2; },
    and: function (v1, v2) { return v1 && v2; },
    or: function (v1, v2) { return v1 || v2; },
  format:function(date){
    newdate=date.toUTCString()
    return newdate.slice(0,16)
  }
}}))


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// app.use(session({ secret: "alen", resave: true,    saveUninitialized: true, cookie:{ maxAge: 180000 } })); 


const oneDay = 1000 * 60 * 60 * 24;
app.use(session({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false 
}));



app.use(function(req, res, next) {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
});


db.con();

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
 
  next(createError(404));
  
});

// error handler
app.use(function(err,req, res, next) { 
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);

    res.render('error');

  
});

module.exports = app;
 