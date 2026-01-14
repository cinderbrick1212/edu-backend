const ForumPost = require('../models/ForumPost');

// @desc    Create a new post
// @route   POST /api/forums
// @access  Private
exports.createPost = async (req, res) => {
    const { title, content, category, tags } = req.body;
    const author = req.userId;

    const post = await ForumPost.create({
        title,
        content,
        category,
        tags,
        author,
    });

    res.status(201).json({ success: true, post });
};

// @desc    Get all posts
// @route   GET /api/forums
// @access  Public
exports.getPosts = async (req, res) => {
    const posts = await ForumPost.find()
        .populate('author', 'profile.name')
        .sort({ createdAt: -1 });
    res.status(200).json({ success: true, posts });
};

// @desc    Get single post
// @route   GET /api/forums/:id
// @access  Public
exports.getPost = async (req, res) => {
    const post = await ForumPost.findById(req.params.id)
        .populate('author', 'profile.name')
        .populate('replies.author', 'profile.name');

    if (!post) {
        return res.status(404).json({ success: false, error: 'Post not found' });
    }

    // Increment views
    post.views += 1;
    await post.save();

    res.status(200).json({ success: true, post });
};

// @desc    Reply to a post
// @route   POST /api/forums/:id/reply
// @access  Private
exports.replyToPost = async (req, res) => {
    const { content } = req.body;
    const author = req.userId;

    const post = await ForumPost.findById(req.params.id);
    if (!post) {
        return res.status(404).json({ success: false, error: 'Post not found' });
    }

    post.replies.push({
        content,
        author,
    });

    await post.save();

    res.status(201).json({ success: true, post });
};
