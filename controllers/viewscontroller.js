const Tour = require('../models/tourmodel');
const User = require('../models/usermodel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find({});

  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.tourSlug }).populate({
    path: 'reviews',
    fields: 'rating review user',
  });
  if (!tour) {
    return next(new AppError('There is no tour with that name', 404));
  }
  res.status(200).render('tour', {
    title: tour.name,
    tour,
  });
});

exports.getLogin = catchAsync(async (req, res) => {
  res.status(200).render('login', {
    title: 'Login',
  });
});

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your Account',
  });
};

exports.updateUserDate = catchAsync(async (req, res, next) => {
  const user = await User.findOneAndUpdate(
    { Email: res.locals.user.Email },
    {
      Name: req.body.Name,
      Email: req.body.Email,
    },
    {
      new: true,
      runValidators: true,
    },
  );
  res.render('account', {
    user: user,
    title: 'Your Account',
  });
});
