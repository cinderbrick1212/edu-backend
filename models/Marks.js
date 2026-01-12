const mongoose = require('mongoose');

const MarksSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  subject: String, // e.g., "Thermodynamics"
  marks: Number,
  totalMarks: { type: Number, default: 100 },
  percentage: Number,
  examType: {
    type: String,
    enum: ['quiz', 'assignment', 'midterm', 'final'],
    required: true,
  },
  recordedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Marks', MarksSchema);
