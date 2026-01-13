const express = require('express');
const { protect } = require('../middleware/auth');
const { getUserStats } = require('../utils/statsAggregation');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.get('/user/:id', protect, asyncHandler(async (req, res) => {
  const stats = await getUserStats(req.params.id);
  res.status(200).json({ success: true, stats });
}));

module.exports = router;
