const Resource = require('../models/Resource');
const path = require('path');

// @desc    Upload a new resource
// @route   POST /api/resources
// @access  Private (teacher/admin)
exports.uploadResource = async (req, res) => {
  const { title, description, category, subject } = req.body;
  const uploadedBy = req.userId;

  if (!req.file) {
    return res.status(400).json({ success: false, error: 'Please upload a file' });
  }

  const fileUrl = `/public/uploads/${req.file.filename}`;

  const resource = await Resource.create({
    title,
    description,
    category,
    fileUrl,
    fileName: req.file.filename,
    fileSize: req.file.size,
    uploadedBy,
    subject,
  });

  res.status(201).json({ success: true, resource });
};

// @desc    Get resources by category
// @route   GET /api/resources/category/:category
// @access  Public
exports.getResourcesByCategory = async (req, res) => {
  const resources = await Resource.find({ category: req.params.category }).populate('uploadedBy', 'profile.name');
  res.json(resources);
};

// @desc    Download a resource
// @route   GET /api/resources/:id/download
// @access  Private
exports.downloadResource = async (req, res) => {
  const resource = await Resource.findById(req.params.id);
  if (!resource) {
    return res.status(404).json({ success: false, error: 'Resource not found' });
  }
  const filePath = path.join(process.cwd(), resource.fileUrl.replace(/^\//, ''));
  res.download(filePath, resource.fileName);
};