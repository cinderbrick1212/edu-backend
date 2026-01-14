const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'excused'],
    required: true,
  },
  classId: String, // e.g., "CSE-101"
  remarks: String,
  createdAt: { type: Date, default: Date.now },
});

// Index to speed up attendance lookups for users
AttendanceSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('Attendance', AttendanceSchema);
