const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  category: {
    type: String,
    enum: ['notes', 'video', 'book', 'assignment', 'solution'],
    default: 'notes',
  },
  fileUrl: {
    type: String,
    required: true,
  },
  fileName: String,
  fileSize: Number, // in bytes
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  downloads: { type: Number, default: 0 },
  subject: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Resource', ResourceSchema);
