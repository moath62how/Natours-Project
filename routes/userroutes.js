const express = require('express');
const router = express.Router();
const usercontrollers = require(`../controllers/usercontrollers.js`);
const authcontroller = require(`../controllers/authcontroller.js`);

router.post('/signup', authcontroller.signup);
router.post('/login', authcontroller.login);
router.get('/logout', authcontroller.logout);
router.post('/forgotPassword', authcontroller.forgotPassword);
router.patch('/resetPassword/:token', authcontroller.resetPassword);

router.use(authcontroller.protect);

router.get('/me', usercontrollers.getMe, usercontrollers.getUser);

router.patch('/updatePassword', authcontroller.updatePassword);
router.patch(
  '/updateMe',
  usercontrollers.uploadUserPhoto,
  usercontrollers.resizeUserPhoto,
  usercontrollers.updateMe,
);
router.delete('/deleteMe', usercontrollers.deleteMe);

router.use(authcontroller.restrictTo('admin'));

router
  .route('/')
  .get(usercontrollers.getAllUsers)
  .patch(usercontrollers.createUser)
  .delete(usercontrollers.deleteUser);

router.route(':/id');

module.exports = router;
