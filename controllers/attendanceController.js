const Attendance = require('../models/Attendance');

// @desc    Check-in attendance
// @route   POST /api/attendance/checkin
// @access  Private
exports.checkIn = async (req, res) => {
    const { date, status, classId, remarks } = req.body;
    const userId = req.userId;

    const attendance = await Attendance.create({
        userId,
        date: date || new Date(),
        status,
        classId,
        remarks,
    });

    res.status(201).json({ success: true, attendance });
};

// @desc    Get user attendance
// @route   GET /api/attendance/user/:userId
// @access  Private
exports.getUserAttendance = async (req, res) => {
    const attendance = await Attendance.find({ userId: req.params.userId }).sort({ date: -1 });
    res.status(200).json({ success: true, attendance });
};
