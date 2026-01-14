const Marks = require('../models/Marks');

// @desc    Submit marks
// @route   POST /api/marks/submit
// @access  Private (Teacher/Admin)
exports.submitMarks = async (req, res) => {
    const { userId, subject, marks, totalMarks, examType } = req.body;

    const percentage = (marks / totalMarks) * 100;

    const markEntry = await Marks.create({
        userId,
        subject,
        marks,
        totalMarks,
        percentage,
        examType,
    });

    res.status(201).json({ success: true, markEntry });
};

// @desc    Get user marks
// @route   GET /api/marks/user/:userId
// @access  Private
exports.getUserMarks = async (req, res) => {
    const marks = await Marks.find({ userId: req.params.userId }).sort({ recordedAt: -1 });
    res.status(200).json({ success: true, marks });
};

// @desc    Get subject average for user
// @route   GET /api/marks/user/:userId/average
// @access  Private
exports.getUserAverage = async (req, res) => {
    const stats = await Marks.aggregate([
        { $match: { userId: require('mongoose').Types.ObjectId(req.params.userId) } },
        {
            $group: {
                _id: null,
                average: { $avg: '$percentage' },
                total: { $sum: 1 },
            },
        },
    ]);

    res.status(200).json({
        success: true,
        average: stats[0] ? stats[0].average : 0,
        totalAssessments: stats[0] ? stats[0].total : 0
    });
};
