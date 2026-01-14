const mongoose = require('mongoose');
const Attendance = require('../models/Attendance');
const Marks = require('../models/Marks');

// Get User Stats Dashboard
exports.getUserStats = async (userId) => {
  try {
    const userObjId = new mongoose.Types.ObjectId(userId);

    // Attendance Percentage
    const attendanceData = await Attendance.aggregate([
      { $match: { userId: userObjId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          present: {
            $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          attendancePercentage: {
            $multiply: [{ $divide: ['$present', '$total'] }, 100],
          },
        },
      },
    ]);

    // Average Marks
    const marksData = await Marks.aggregate([
      { $match: { userId: userObjId } },
      {
        $group: {
          _id: null,
          averageMarks: { $avg: '$percentage' },
          totalAssessments: { $sum: 1 },
        },
      },
    ]);

    return {
      attendance: attendanceData[0] || { attendancePercentage: 0 },
      marks: marksData[0] || { averageMarks: 0, totalAssessments: 0 },
    };
  } catch (err) {
    throw err;
  }
};
