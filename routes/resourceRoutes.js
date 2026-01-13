const express = require('express');
const resourceController = require('../controllers/resourceController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.post('/', protect, upload.single('file'), asyncHandler(resourceController.uploadResource));
router.get('/category/:category', asyncHandler(resourceController.getResourcesByCategory));
router.get('/:id/download', asyncHandler(resourceController.downloadResource));

module.exports = router;
