const Resource = require('../models/Resource');

// @desc    Upload a new resource
// @route   POST /api/resources
// @access  Private (teacher/admin)
exports.uploadResource = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const createdBy = req.user.id;

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    const resource = await Resource.create({
      title,
      description,
      category,
      fileName: req.file.filename,
      filePath: req.file.path,
      fileType: req.file.mimetype,
      createdBy,
    });

    res.status(201).json(resource);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get resources by category
// @route   GET /api/resources/category/:category
// @access  Public
exports.getResourcesByCategory = async (req, res) => {
  try {
    const resources = await Resource.find({ category: req.params.category })
      .populate('createdBy', 'profile.name');
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Download a resource
// @route   GET /api/resources/:id/download
// @access  Private
exports.downloadResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    res.download(resource.filePath, resource.fileName);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};