const mongoose = require('mongoose');

const ForumPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: String,
    enum: ['doubt', 'discussion', 'announcement'],
    default: 'doubt',
  },
  tags: [String],
  replies: [
    {
      content: String,
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      createdAt: { type: Date, default: Date.now },
      likes: { type: Number, default: 0 },
    },
  ],
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ForumPost', ForumPostSchema);
