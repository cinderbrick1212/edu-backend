const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Register User
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { email, password, role } = req.body;

  let user = await User.findOne({ email });
  if (user) {
    return res.status(400).json({ success: false, error: 'User already exists' });
  }

  user = new User({
    email,
    password,
    role: role || 'student',
    profile: {
      name: email.split('@')[0],
    },
  });

  await user.save();
  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    token,
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
    },
  });
};

// Login User
exports.login = async (req, res) => {
  const { email, password } = req.body;
  console.log(`[AUTH] Login attempt for: ${email}`);

  if (!email || !password) {
    console.log('[AUTH] Missing email or password');
    return res.status(400).json({ success: false, error: 'Please provide email and password' });
  }

  const user = await User.findOne({ email });
  if (!user) {
    console.log(`[AUTH] User not found: ${email}`);
    return res.status(401).json({ success: false, error: 'Invalid credentials' });
  }

  const isMatch = await user.comparePassword(password);
  console.log(`[AUTH] Password match for ${email}: ${isMatch}`);
  if (!isMatch) {
    return res.status(401).json({ success: false, error: 'Invalid credentials' });
  }

  const token = generateToken(user._id);
  res.status(200).json({
    success: true,
    token,
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
    },
  });
};

// Get Current User
exports.getMe = async (req, res) => {
  const user = await User.findById(req.userId);
  res.status(200).json({ success: true, user });
};
