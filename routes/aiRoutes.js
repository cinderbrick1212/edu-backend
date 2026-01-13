const express = require('express');
const { protect } = require('../middleware/auth');
const aiController = require('../controllers/aiController');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.post('/tutor', protect, asyncHandler(aiController.askTutor));

module.exports = router;
