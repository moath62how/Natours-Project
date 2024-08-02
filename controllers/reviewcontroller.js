// const AppError = require('./../utils/appError');
const Review = require('./../models/reviewmodel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerfactory');

exports.createReview = catchAsync(async (req, res, next) => {
  const { review, rating } = req.body;
  const { user } = req;
  const tourId = req.body.tourId || req.params.tourId;
  const newReview = await Review.create({
    rating,
    review,
    tour: tourId,
    user: user._id,
  });
  res.status(201).json({
    status: 'success',
    data: newReview,
  });
});

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
