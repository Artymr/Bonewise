var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config();
var connectDB = require('./tfg/config/db');


var indexRouter = require('./tfg/routes/index');
var usersRouter = require('./tfg/routes/users');

var app = express();

// Conectar a la base de datos
connectDB().catch(err => {
  console.error('Error al conectar a la base de datos:', err);
  process.exit(1);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

const pacientesRouter = require('./tfg/routes/pacientesRoutes');
console.log('rutas cargadas correctamente:', pacientesRouter);

app.use('/api/pacientes', (req, res, next) => {
  console.log(`API ${req.method} ${req.url}`);
  next();
}, pacientesRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
