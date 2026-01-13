const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// Readiness probe: checks DB connectivity
router.get('/readiness', (req, res) => {
  const state = mongoose.connection.readyState; // 0 disconnected,1 connected,2 connecting,3 disconnecting
  if (state === 1) return res.status(200).json({ ready: true, state });
  res.status(503).json({ ready: false, state });
});

module.exports = router;
