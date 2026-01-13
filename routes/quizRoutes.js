const express = require('express');
const quizController = require('../controllers/quizController');
const { protect } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.post('/', protect, asyncHandler(quizController.createQuiz)); // Teacher
router.get('/', asyncHandler(quizController.getQuizzes));
router.post('/:id/attempt', protect, asyncHandler(quizController.submitQuizAttempt));
router.get('/user/attempts', protect, asyncHandler(quizController.getUserAttempts));

module.exports = router;
