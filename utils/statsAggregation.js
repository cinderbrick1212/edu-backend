const Attendance = require('../models/Attendance');
const Marks = require('../models/Marks');

// Get User Stats Dashboard
exports.getUserStats = async (userId) => {
  try {
    // Attendance Percentage
    const attendanceData = await Attendance.aggregate([
      { $match: { userId: require('mongoose').Types.ObjectId(userId) } },
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
      { $match: { userId: require('mongoose').Types.ObjectId(userId) } },
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
