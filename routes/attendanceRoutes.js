const express = require('express');
const { checkIn, getUserAttendance } = require('../controllers/attendanceController');
const { protect } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.post('/checkin', protect, asyncHandler(checkIn));
router.get('/user/:userId', protect, asyncHandler(getUserAttendance));

module.exports = router;
