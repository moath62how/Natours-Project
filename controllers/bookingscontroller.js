const stripe = require('stripe')(process.env.STRIPP_SECRET_KEY);
const AppError = require('../utils/appError');
const Tour = require('./../models/tourmodel');
const catchAsync = require('./../utils/catchAsync');

const factory = require('./handlerfactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);

  // 2) Create Checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
          },
        },
      },
    ],
    mode: 'payment',
  });

  // 3) Create Session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});

exports.createBookingCheckout = (req, res, next) => {
  const { tour, user, price } = req.query;
  if (!tour && !user && !price) return next();
};
