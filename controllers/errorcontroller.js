const AppError = require('./../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(', ')}`;
  return new AppError(message, 400);
};
const handelDuplicateFieldsDB = () => {
  const message = `Duplicate field value , use another value instead!`;
  return new AppError(message, 400);
};
const handleJWTError = () => {
  new AppError('Invalid token! please login again', 401);
};

const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      err,
      message: err.message,
      stack: err.stack,
    });
  }
  console.log('here');
  res.status(err.statusCode).render('error', {
    title: 'Something went wrong ❗💥',
    message: err.message,
  });
};

const handleJWTExpiredError = () =>
  new AppError('Your token has expired please try logging in again', 401);
const sendErrorProd = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } else {
      // eslint-disable-next-line no-console
      console.error('ERROR 💥', err);
      res.status(500).json({
        status: 'error',
        message: 'Something went very wrong 🤔 ',
      });
    }
  } else {
    if (err.isOperational) {
      return res.status(err.statusCode).render('error', {
        title: 'Something went wrong ❗💥',
        message: err.message,
      });
    }
  }
  res.status(err.statusCode).render('error', {
    title: 'Something went wrong ❗💥',
    message: 'Please try again Later',
  });
};

module.exports = (err, req, res, next) => {
  // console.log(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};
