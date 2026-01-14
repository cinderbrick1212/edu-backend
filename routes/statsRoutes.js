const express = require('express');
const { protect } = require('../middleware/auth');
const { getDashboard, getStatsHistory } = require('../controllers/statsController');
const { getUserStats } = require('../utils/statsAggregation');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

// New Revamp Endpoints
router.get('/dashboard', protect, asyncHandler(getDashboard));
router.get('/history', protect, asyncHandler(getStatsHistory));

// Legacy Endpoint
router.get('/user/:id', protect, asyncHandler(async (req, res) => {
  const stats = await getUserStats(req.params.id);
  res.status(200).json(stats);
}));

module.exports = router;
