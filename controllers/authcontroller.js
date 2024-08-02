const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/usermodel');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const email = require('./../utils/email');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRETE, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIES_EXPIRES * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }
  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const { Name, Email, password, confirmPassword, passwordChangedAt, role } =
    req.body;
  const newUser = await User.create({
    Name,
    Email,
    password,
    confirmPassword,
    passwordChangedAt,
    role,
  });
  const url = `${req.protocol}://${req.get('host')}/me`;
  const mail = new email(newUser, url);
  mail.sendWelcome();
  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { Email, password } = req.body;

  if (!Email || !password) {
    return next(new AppError('Please enter an email and password', 400));
  }
  const user = await User.findOne({ Email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    if (req.originalUrl.startsWith('/api')) {
      return next(new AppError('incorrect email or password', 401));
    }
  }

  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('Invalid authorization(You are not logged in)'),
      401,
    );
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRETE);

  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(new AppError('The User does no longer exist', 401));
  }

  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'The user recently changed password please login again',
        401,
      ),
    );
  }
  res.locals.user = freshUser;
  req.user = freshUser;

  next();
});

exports.isLoggedIn = async (req, res, next) => {
  try {
    if (req.cookies.jwt) {
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRETE,
      );

      const freshUser = await User.findById(decoded.id);
      if (!freshUser || freshUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      res.locals.user = freshUser;
      return next();
    } else {
      return next();
    }
  } catch (err) {
    return next();
  }
};

exports.logout = (req, res, next) => {
  res.cookie('jwt', 'Logged Out', {
    expires: new Date(Date.now() + 1000 * 1),
    httpOnly: true,
  });
  res.status(200).json({
    status: 'success',
  });
};

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You don't have permission to preform this action", 403),
      );
    }
    next();
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ Email: req.body.Email });
  if (!user)
    return next(new AppError('There is no user with that email address', 404));

  const resetToken = user.createPasswordRestToken();

  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get(
    'host',
  )}/api/v1/users/resetPassword/${resetToken}`;

  try {
    const mail = new email(user, resetURL);
    mail.sendPasswordReset();
  } catch (err) {
    user.passwordRestToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError('there was an error sending an email, try agin later', 500),
    );
  }
  res.status(200).json({
    status: 'success',
    message: 'token was sent to email',
  });
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordRestToken: hashedToken,
    passwordResetExpires: {
      $gt: Date.now(),
    },
  });
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetExpires = undefined;
  user.passwordResetToken = undefined;

  await user.save();

  createSendToken(user, 201, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1];
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRETE);
  const user = await User.findById(decoded.id).select('password');
  if (!(await user.correctPassword(req.body.CurrentPassword, user.password))) {
    return next(new AppError('Please enter your current password ', 404));
  }
  if (!req.body.newPassword) {
    return next(new AppError('Please enter your new password ', 404));
  }
  user.password = req.body.newPassword;
  user.confirmPassword = req.body.newPasswordConfirm;

  await user.save({ validateBeforeSave: true });

  res.status(201).json({
    status: 'success',
    token,
  });
  next();
});
