const mongoose = require('mongoose');

const QuizAttemptSchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  answers: [
    {
      questionId: mongoose.Schema.Types.ObjectId,
      userAnswer: String,
      isCorrect: Boolean,
      marksObtained: Number,
    },
  ],
  totalScore: Number,
  percentage: Number,
  attemptedAt: { type: Date, default: Date.now },
  timeTaken: Number, // seconds
});

module.exports = mongoose.model('QuizAttempt', QuizAttemptSchema);
