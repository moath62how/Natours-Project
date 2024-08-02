const express = require('express');

const router = express.Router({ mergeParams: true });
const reviewcontroller = require('./../controllers/reviewcontroller');
const { protect, restrictTo } = require('./../controllers/authcontroller');

router.use(protect);

router
  .route('/')
  .get(protect, reviewcontroller.getAllReviews)
  .post(protect, restrictTo('user'), reviewcontroller.createReview);

router
  .route('/:id')
  .delete(
    protect,
    restrictTo('admin', 'lead-guide'),
    reviewcontroller.deleteReview,
  )
  .patch(protect, restrictTo('user', 'admin'), reviewcontroller.updateReview)
  .get(protect, reviewcontroller.getReview, restrictTo('user', 'admin'));

module.exports = router;
