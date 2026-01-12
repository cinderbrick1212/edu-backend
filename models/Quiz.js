const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  questions: [
    {
      questionText: String,
      questionType: { type: String, enum: ['mcq', 'short_answer'] }, // Extensible
      options: [String], // For MCQs
      correctAnswer: String, // Index or text
      marks: { type: Number, default: 1 },
      explanation: String,
    },
  ],
  totalMarks: Number,
  timeLimit: { type: Number, default: 30 }, // minutes
  isPublished: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Quiz', QuizSchema);
