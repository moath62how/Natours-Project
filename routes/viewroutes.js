const express = require('express');

const router = express.Router();
const authcontroller = require('../controllers/authcontroller');
const viewscontroller = require('../controllers/viewscontroller');

// router.use(authcontroller.isLoggedIn);
router.get('/', authcontroller.isLoggedIn, viewscontroller.getOverview);
router.get(
  '/tour/:tourSlug',
  authcontroller.isLoggedIn,
  viewscontroller.getTour,
);
router.get('/login', authcontroller.isLoggedIn, viewscontroller.getLogin);
router.get('/me', authcontroller.protect, viewscontroller.getAccount);
router.post(
  '/submit-user-data',
  authcontroller.protect,
  viewscontroller.updateUserDate,
);

module.exports = router;
