const express = require('express');
const quizController = require('../controllers/quizController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, quizController.createQuiz); // Teacher
router.get('/', quizController.getQuizzes);
router.post('/:id/attempt', protect, quizController.submitQuizAttempt);
router.get('/user/attempts', protect, quizController.getUserAttempts);

module.exports = router;
