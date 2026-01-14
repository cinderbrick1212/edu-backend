const express = require('express');
const { createPost, getPosts, getPost, replyToPost } = require('../controllers/forumController');
const { protect } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.route('/')
    .get(asyncHandler(getPosts))
    .post(protect, asyncHandler(createPost));

router.get('/:id', asyncHandler(getPost));
router.post('/:id/reply', protect, asyncHandler(replyToPost));

module.exports = router;
