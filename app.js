var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var BinarySearchTree = require('binary-search-tree').BinarySearchTree;
var ordersBst = new BinarySearchTree();

var redis = require('redis');
var client = redis.createClient();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

client.on('error', (err) => {
  console.log('Redis error: ', err);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

client.on('connect', function () {
  console.log('connected');
  client.flushdb(function (err, succeeded) {
    console.log('flush succeeded'); // will be true if successfull
  });
});

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.get('/orders', function (req, res, next) {
  ordersBst.prettyPrint();
  req.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json(ordersBst.data);
});

app.get('/order/:price', function (req, res, next) {
  let price = req.params.price;
  client.get(price, function (err, obj) {
    if (!obj) {
      res.statusCode = 404;
      res.end(`${price} does not exists!`);
    } else {
      req.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(obj);
    }
  });
});

app.post('/order', function (req, res, next) {
  let price = req.body.price;
  let side = req.body.side;

  client.exists(price, function (err, exists) {
    if (!exists) {
      client.set(price, side, function (err, reply) {
        if (reply === 'OK') {
          ordersBst.insert(price, side);
          req.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(reply);
        }
      });
    } else {
      client.get(price, function (err, obj) {
        if (obj && obj != side) {
          client.del(price, function (err, obj) {
            ordersBst.delete(price);
            req.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            // res.json(obj);
            res.end(`${price} deleted successfully!`);
          });
        } else {
          res.statusCode = 403;
          res.end(`${price} already exists!`);
        }
      });
    }
  });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
