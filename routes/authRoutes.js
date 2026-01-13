const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
  ],
  asyncHandler(authController.register)
);

router.post(
  '/login',
  [
    body('email').isEmail(),
    body('password').exists(),
  ],
  asyncHandler(authController.login)
);

router.get('/me', protect, asyncHandler(authController.getMe));

module.exports = router;
