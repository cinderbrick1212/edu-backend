const mongoose = require('mongoose');
const Attendance = require('../models/Attendance');
const Marks = require('../models/Marks');
const { getUserStats } = require('../utils/statsAggregation');

// @desc    Get dashboard summary (Attendance % + Avg Marks)
// @route   GET /api/stats/dashboard
// @access  Private
exports.getDashboard = async (req, res) => {
    const stats = await getUserStats(req.userId);
    res.json(stats);
};

// @desc    Get historical data for charts
// @route   GET /api/stats/history
// @access  Private
exports.getStatsHistory = async (req, res) => {
    const userId = new mongoose.Types.ObjectId(req.userId);

    // Get last 30 days of attendance
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const attendanceHistory = await Attendance.aggregate([
        {
            $match: {
                userId: userId,
                date: { $gte: thirtyDaysAgo }
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                status: { $first: "$status" }
            }
        },
        { $sort: { "_id": 1 } }
    ]);

    // Get marks history
    const marksHistory = await Marks.find({ userId: req.userId })
        .select('subject marks percentage recordedAt')
        .sort({ recordedAt: 1 });

    res.json({
        attendanceHistory,
        marksHistory
    });
};
