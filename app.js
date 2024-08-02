const path = require('path');
const morgan = require('morgan');
const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const AppError = require(`${__dirname}/utils/appError.js`);
const globalErrorHandler = require('./controllers/errorcontroller');

const userRouter = require(`${__dirname}/routes/userroutes`);
const toursRouter = require(`${__dirname}/routes/tourroutes`);
const reviewRouter = require(`${__dirname}/routes/reviewroutes`);
const bookingrouter = require(`${__dirname}/routes/bookingroutes`);
const viewrouter = require(`${__dirname}/routes/viewroutes`);

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// MIDDLEWARE

app.use(cors());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'To many requests from this ip please try agin in one hour!',
});

app.use('/api', limiter);
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(
  express.json({
    limit: '10kb',
  }),
);

app.use(mongoSanitize());

app.use(xss());

app.use(
  hpp({
    whitelist: [
      'duration',
      'maxGroupSize',
      'ratingsAverage',
      'ratingsQuantity',
      'difficulty',
      'price',
    ],
  }),
);

//set security http headers

// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: ["'self'", 'https:', 'http:', 'data:', 'ws:'],
//       baseUri: ["'self'"],
//       fontSrc: ["'self'", 'https:', 'http:', 'data:'],
//       scriptSrc: ["'self'", 'https:', 'http:', 'blob:'],
//       styleSrc: ["'self'", "'unsafe-inline'", 'https:', 'http:'],
//     },
//   }),
// );

// app.use((req, res, next) => {
//   console.log('Hello from middleware 👋');
//   next();
// });

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

//ROUTE HANDLERS

//ROUTES
app.use('/', viewrouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', toursRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingrouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server ❗`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
