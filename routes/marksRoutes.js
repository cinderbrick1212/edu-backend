const express = require('express');
const { submitMarks, getUserMarks, getUserAverage } = require('../controllers/marksController');
const { protect, authorize } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.post('/submit', protect, authorize(['teacher', 'admin']), asyncHandler(submitMarks));
router.get('/user/:userId', protect, asyncHandler(getUserMarks));
router.get('/user/:userId/average', protect, asyncHandler(getUserAverage));

module.exports = router;
