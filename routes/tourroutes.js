const express = require('express');

const {
  getAllTours,
  createTour,
  getTour,
  updateTours,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
  getTourWithin,
  getDistances,
} = require(`${__dirname}/..//controllers/tourcontroller`);
const { protect, restrictTo } = require('./../controllers/authcontroller');
const reviewrouter = require('./../routes/reviewroutes');
const {
  uploadTourImages,
  resizeTourImages,
} = require('../controllers/tourcontroller');
const bookingcontroller = require('../controllers/bookingcontroller');
// const reviewcontroller = require('./../controllers/reviewcontroller');

const router = express.Router();

router.use('/:tourId/reviews', reviewrouter);

router.route('/tour-stats').get(getTourStats);

router
  .route('/tour-within/:distance/center/:latlng/unit/:unit')
  .get(protect, getTourWithin);

router.route('/distance/:latlng/unit/:unit').get(protect, getDistances);

router
  .route('/monthly-plan/:year')
  .get(protect, restrictTo('admin', 'lead-guide', 'guide'), getMonthlyPlan);

router.route('/top-5-cheap').get(aliasTopTours, getAllTours);

router
  .route('/')
  .get(getAllTours)
  .post(protect, restrictTo('admin', 'lead-guide'), createTour);

router
  .route('/:id')
  .get(getTour)
  .patch(
    protect,
    restrictTo('admin', 'lead-guide'),
    uploadTourImages,
    resizeTourImages,
    updateTours,
  )
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

// router
//   .route('/:id/reviews')
//   .post(protect, restrictTo('user'), reviewcontroller.createReview);

module.exports = router;
