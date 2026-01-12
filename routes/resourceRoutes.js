const express = require('express');
const resourceController = require('../controllers/resourceController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.post('/', protect, upload.single('file'), resourceController.uploadResource);
router.get('/category/:category', resourceController.getResourcesByCategory);
router.get('/:id/download', resourceController.downloadResource);

module.exports = router;
