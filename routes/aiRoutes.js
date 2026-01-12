const express = require('express');
const { protect } = require('../middleware/auth');
const aiController = require('../controllers/aiController');

const router = express.Router();

router.post('/tutor', protect, aiController.askTutor);

module.exports = router;
