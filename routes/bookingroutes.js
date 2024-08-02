const express = require('express');
const authcontroller = require('../controllers/authcontroller');
const bookingscontroller = require('../controllers/bookingscontroller');
const router = express.Router();

router.get(
  '/checkout-session/:tourId',
  authcontroller.protect,
  bookingscontroller.getCheckoutSession,
);
module.exports = router;
