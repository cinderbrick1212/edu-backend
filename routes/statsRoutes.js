const express = require('express');
const { protect } = require('../middleware/auth');
const { getUserStats } = require('../utils/statsAggregation');

const router = express.Router();

router.get('/user/:id', protect, async (req, res) => {
  try {
    const stats = await getUserStats(req.params.id);
    res.status(200).json({ success: true, stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
