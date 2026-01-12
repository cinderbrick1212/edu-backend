# Complete Production-Ready Node.js + Express + MongoDB Backend Boilerplate Guide
## For BTech CSE Students Building React Native Educational Platforms

---

## Introduction

This guide walks you through building a **production-ready backend** for an educational React Native app using **Node.js, Express, and MongoDB**. You'll deploy it **completely free** using MongoDB Atlas M0 (512 MB storage, forever free) and Render (750 free hours/month). Perfect for a BTech student to learn full-stack development while respecting budget constraints.

**Target Audience:** First-year CSE student, intermediate JavaScript knowledge, new to backend development  
**Total Setup Time:** 3-4 hours  
**Cost:** $0 (with free tier credentials)

---

## 1. Project Setup & Boilerplate Structure

### Step 1: Initialize Your Project

```bash
# Create project directory
mkdir edu-backend
cd edu-backend

# Initialize Node project
npm init -y

# Create folder structure
mkdir models controllers routes middleware utils config
mkdir public/uploads
```

### Step 2: Install Dependencies

```bash
npm install express mongoose cors dotenv jsonwebtoken bcryptjs multer axios helmet morgan express-validator @google/generative-ai

# Optional: For development
npm install --save-dev nodemon
```

### Step 3: Create `.env` File

```env
# Database
MONGODB_URI=mongodb+srv://eduuser:yKPCIyhzsI8J0p14@cluster0.tscye48.mongodb.net/?appName=Cluster0

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Gemini
GEMINI_API_KEY=AIzaSyDp_Bcz4KOg813IfexLspwL0DPEnjs_57E

# File Upload (Optional: Cloudinary for production)
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Nodemailer (Optional)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### Step 4: Create `package.json` Scripts

```json
{
  "name": "edu-backend",
  "version": "1.0.0",
  "description": "Educational platform backend",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": ["node", "express", "mongodb"],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.5.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "multer": "^1.4.5-lts.1",
    "axios": "^1.5.0",
    "helmet": "^7.0.0",
    "morgan": "^1.10.0",
    "express-validator": "^7.0.0",
    "@google/generative-ai": "^0.2.1"
  }
}
```

### Step 5: Create Main `index.js`

```javascript
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// ============ MIDDLEWARE ============
app.use(helmet()); // Security headers
app.use(morgan('combined')); // Logging
app.use(express.json());
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors({
  origin: ['http://localhost:3000', 'http://192.168.x.x:5000'], // Update for your React Native IP
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use('/public', express.static('public')); // Serve uploaded files

// ============ ROUTES ============
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/quizzes', require('./routes/quizRoutes'));
app.use('/api/forums', require('./routes/forumRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/marks', require('./routes/marksRoutes'));
app.use('/api/resources', require('./routes/resourceRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

// ============ HEALTH CHECK ============
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Backend running 🚀', timestamp: new Date() });
});

// ============ ERROR HANDLING ============
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ success: false, error: message });
});

// ============ DATABASE CONNECTION ============
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Connected'))
.catch((err) => console.error('❌ MongoDB Error:', err));

// ============ START SERVER ============
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🎓 Backend running on http://localhost:${PORT}`);
});
```

---

## 2. Database Schemas (Mongoose Models)

### `models/User.js`

```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    default: 'student',
  },
  profile: {
    name: String,
    avatar: String,
    bio: String,
    semester: Number,
    branch: String, // CSE, ECE, etc.
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
```

### `models/Quiz.js`

```javascript
const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  questions: [
    {
      questionText: String,
      questionType: { type: String, enum: ['mcq', 'short_answer'] }, // Extensible
      options: [String], // For MCQs
      correctAnswer: String, // Index or text
      marks: { type: Number, default: 1 },
      explanation: String,
    },
  ],
  totalMarks: Number,
  timeLimit: { type: Number, default: 30 }, // minutes
  isPublished: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Quiz', QuizSchema);
```

### `models/QuizAttempt.js`

```javascript
const mongoose = require('mongoose');

const QuizAttemptSchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  answers: [
    {
      questionId: mongoose.Schema.Types.ObjectId,
      userAnswer: String,
      isCorrect: Boolean,
      marksObtained: Number,
    },
  ],
  totalScore: Number,
  percentage: Number,
  attemptedAt: { type: Date, default: Date.now },
  timeTaken: Number, // seconds
});

module.exports = mongoose.model('QuizAttempt', QuizAttemptSchema);
```

### `models/ForumPost.js`

```javascript
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
```

### `models/Attendance.js`

```javascript
const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'excused'],
    required: true,
  },
  classId: String, // e.g., "CSE-101"
  remarks: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Attendance', AttendanceSchema);
```

### `models/Marks.js`

```javascript
const mongoose = require('mongoose');

const MarksSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  subject: String, // e.g., "Thermodynamics"
  marks: Number,
  totalMarks: { type: Number, default: 100 },
  percentage: Number,
  examType: {
    type: String,
    enum: ['quiz', 'assignment', 'midterm', 'final'],
    required: true,
  },
  recordedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Marks', MarksSchema);
```

### `models/Resource.js`

```javascript
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
```

---

## 3. Middleware & Controllers

### `middleware/auth.js`

```javascript
const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  // Get token from header
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ success: false, error: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ success: false, error: 'Token is not valid' });
  }
};

const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({ success: false, error: 'Insufficient permissions' });
    }
    next();
  };
};

module.exports = { protect, authorize };
```

### `middleware/upload.js`

```javascript
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = 'public/uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  // Allow PDF, images, documents
  const allowedTypes = /pdf|jpg|jpeg|png|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only images, PDFs, and documents are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

module.exports = upload;
```

### `controllers/authController.js`

```javascript
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
  try {
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
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Login User
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
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
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get Current User
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
```

### `controllers/quizController.js`

```javascript
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');

// Create Quiz (Teacher only)
exports.createQuiz = async (req, res) => {
  try {
    const { title, description, questions, timeLimit } = req.body;

    // Calculate total marks
    const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 1), 0);

    const quiz = new Quiz({
      title,
      description,
      questions,
      timeLimit,
      totalMarks,
      createdBy: req.userId,
    });

    await quiz.save();
    res.status(201).json({ success: true, quiz });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get All Quizzes
exports.getQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ isPublished: true }).populate('createdBy', 'profile.name');
    res.status(200).json({ success: true, quizzes });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Submit Quiz Attempt (Auto-grade MCQs)
exports.submitQuizAttempt = async (req, res) => {
  try {
    const { quizId, answers } = req.body; // answers = [{questionId, userAnswer}, ...]

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, error: 'Quiz not found' });
    }

    let totalScore = 0;
    const gradedAnswers = answers.map((ans) => {
      const question = quiz.questions.find((q) => q._id.toString() === ans.questionId);
      const isCorrect = question.correctAnswer === ans.userAnswer;
      const marksObtained = isCorrect ? question.marks : 0;

      totalScore += marksObtained;

      return {
        questionId: ans.questionId,
        userAnswer: ans.userAnswer,
        isCorrect,
        marksObtained,
      };
    });

    const percentage = (totalScore / quiz.totalMarks) * 100;

    const attempt = new QuizAttempt({
      quizId,
      userId: req.userId,
      answers: gradedAnswers,
      totalScore,
      percentage,
    });

    await attempt.save();

    res.status(201).json({
      success: true,
      attempt: {
        score: totalScore,
        totalMarks: quiz.totalMarks,
        percentage: percentage.toFixed(2),
        answers: gradedAnswers,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get User's Quiz Attempts
exports.getUserAttempts = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ userId: req.userId })
      .populate('quizId', 'title totalMarks')
      .sort({ attemptedAt: -1 });

    res.status(200).json({ success: true, attempts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
```

---

## 4. Core API Routes

### `routes/authRoutes.js`

```javascript
const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
  ],
  authController.register
);

router.post(
  '/login',
  [
    body('email').isEmail(),
    body('password').exists(),
  ],
  authController.login
);

router.get('/me', protect, authController.getMe);

module.exports = router;
```

### `routes/quizRoutes.js`

```javascript
const express = require('express');
const quizController = require('../controllers/quizController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, quizController.createQuiz); // Teacher
router.get('/', quizController.getQuizzes);
router.post('/:id/attempt', protect, quizController.submitQuizAttempt);
router.get('/user/attempts', protect, quizController.getUserAttempts);

module.exports = router;
```

### `routes/resourceRoutes.js`

```javascript
const express = require('express');
const resourceController = require('../controllers/resourceController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.post('/', protect, upload.single('file'), resourceController.uploadResource);
router.get('/category/:category', resourceController.getResourcesByCategory);
router.get('/:id/download', resourceController.downloadResource);

module.exports = router;
```

---

## 5. Stats Aggregation with MongoDB Pipelines

### `utils/statsAggregation.js`

```javascript
const Attendance = require('../models/Attendance');
const Marks = require('../models/Marks');

// Get User Stats Dashboard
exports.getUserStats = async (userId) => {
  try {
    // Attendance Percentage
    const attendanceData = await Attendance.aggregate([
      { $match: { userId: require('mongoose').Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          present: {
            $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          attendancePercentage: {
            $multiply: [{ $divide: ['$present', '$total'] }, 100],
          },
        },
      },
    ]);

    // Average Marks
    const marksData = await Marks.aggregate([
      { $match: { userId: require('mongoose').Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          averageMarks: { $avg: '$percentage' },
          totalAssessments: { $sum: 1 },
        },
      },
    ]);

    return {
      attendance: attendanceData[0] || { attendancePercentage: 0 },
      marks: marksData[0] || { averageMarks: 0, totalAssessments: 0 },
    };
  } catch (err) {
    throw err;
  }
};
```

### `routes/statsRoutes.js`

```javascript
const express = require('express');
const { protect } = require('../middleware/auth');
const { getUserStats } = require('../utils/statsAggregation');

const router = express.Router();

router.get('/user/:id', protect, async (req, res) => {
  try {
    const stats = await getUserStats(req.params.id);
    res.status(200).json({ success: true, stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
```

---

## 6. AI Tutor Proxy Controller

### `controllers/aiController.js`

```javascript
const { GoogleGenerativeAI } = require('@google/generative-ai');

// AI Tutor Endpoint (Proxy to Gemini)
exports.askTutor = async (req, res) => {
  try {
    const { question, context } = req.body; // context = "thermodynamics", "vectors", etc.

    if (!question) {
      return res.status(400).json({ success: false, error: 'Question required' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro"});

    const prompt = `You are an AI tutor for BTech CSE students. 
    Context: ${context || 'General Engineering'}.
    Provide clear, concise explanations with examples suitable for a first-year student.
    Avoid overly complex jargon unless explained.
    
    Question: ${question}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const tutorResponse = response.text();

    res.status(200).json({
      success: true,
      answer: tutorResponse,
      question,
      context,
    });
  } catch (err) {
    console.error('Gemini Error:', err.message);
    res.status(500).json({ success: false, error: 'AI service error' });
  }
};
```

### `routes/aiRoutes.js`

```javascript
const express = require('express');
const { protect } = require('../middleware/auth');
const aiController = require('../controllers/aiController');

const router = express.Router();

router.post('/tutor', protect, aiController.askTutor);

module.exports = router;
```

---

## 7. Deployment Guide

### Step 1: MongoDB Atlas Setup

1. **Create Account:** Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. **Create M0 Cluster:**
   - Click "Build a Database"
   - Select "Shared" → M0 (Free)
   - Choose region: *Asia (Mumbai)* for Delhi
3. **Create Database User:**
   - Username: `eduuser`
   - Password: Generate strong password
4. **Whitelist IP:**
   - Add `0.0.0.0/0` (allows all IPs, for demo only; restrict in production)
5. **Get Connection String:**
   - Click "Connect" → "Drivers"
   - Copy MongoDB URI
   - Update `.env` with your credentials

### Step 2: Render Deployment

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/edu-backend.git
   git push -u origin main
   ```

2. **Connect Render:**
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect GitHub repo
   - Select your repository

3. **Configure Render Settings:**
   - **Name:** `edu-backend`
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node index.js`
   - **Plan:** Free

4. **Add Environment Variables:**
   - `MONGODB_URI`: Your connection string
   - `JWT_SECRET`: Generate: `openssl rand -base64 32`
   - `GEMINI_API_KEY`: From Google AI Studio
   - `NODE_ENV`: `production`

5. **Deploy:**
   - Click "Create Web Service"
   - Wait for build to complete (~3 min)
   - Get your URL: `https://edu-backend.onrender.com`

### Step 3: React Native Configuration

Update your React Native `axios` config:

```javascript
import axios from 'axios';

const API_BASE_URL = 'https://edu-backend.onrender.com/api'; // Or localhost for dev

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add JWT token to headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // or AsyncStorage for React Native
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

---

## 8. Deployment Considerations & Cold Starts

### ⚠️ Render Free Tier Limitations

- **Spins down after 15 min inactivity** → Cold start (rebuilds & redeploys)
- **First request takes 30-60 seconds**
- **750 hours/month** (enough for 1 service 24/7)

### Solution: Health Check Cron

Add to your React Native app or use a cron job:

```javascript
// Keep-alive function
const keepAlive = () => {
  setInterval(async () => {
    try {
      await axios.get('https://edu-backend.onrender.com/health');
      console.log('✅ Backend pinged');
    } catch (err) {
      console.log('Backend sleeping...');
    }
  }, 10 * 60 * 1000); // Ping every 10 minutes
};
```

Or use free services like [EasyCron](https://www.easycron.com/) to ping `/health` endpoint.

---

## 9. Common Pitfalls & Solutions

### ❌ CORS Issues in React Native

**Problem:** `Access-Control-Allow-Origin` error on Android/iOS

**Solution:**
```javascript
// In index.js
app.use(cors({
  origin: '*', // For development only
  credentials: true,
}));
```

### ❌ MongoDB Connection String Errors

**Problem:** `MongoNetworkError`

**Solution:**
- Verify IP whitelist in Atlas (add 0.0.0.0/0)
- Check `.env` file syntax: No quotes around URI
- Restart server after changing `.env`

### ❌ File Upload Fails

**Problem:** Files not saving in `public/uploads`

**Solution:**
```bash
mkdir -p public/uploads
chmod 755 public/uploads
```

### ❌ JWT Token Expires Silently

**Problem:** User logged out without warning

**Solution:** Handle in React Native:
```javascript
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // Clear token, redirect to login
      AsyncStorage.removeItem('token');
      navigation.navigate('Login');
    }
    return Promise.reject(err);
  }
);
```

---

## 10. Testing with Postman

### Import Collection

Create `Postman_Collection.json`:

```json
{
  "info": { "name": "Edu Platform API", "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json" },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "url": "{{BASE_URL}}/auth/register",
            "body": { "raw": "{\"email\": \"student@edu.com\", \"password\": \"password123\"}" }
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "url": "{{BASE_URL}}/auth/login",
            "body": { "raw": "{\"email\": \"student@edu.com\", \"password\": \"password123\"}" }
          }
        }
      ]
    }
  ]
}
```

**Set Variables:**
- `BASE_URL`: `https://edu-backend.onrender.com/api`
- `TOKEN`: (Set after login)

---

## 11. Security Best Practices

### ✅ Implemented

- ✅ Password hashing with bcryptjs (10 salts)
- ✅ JWT authentication
- ✅ Input validation (express-validator)
- ✅ Helmet for security headers
- ✅ CORS for specific origins

### 📋 Production Checklist

```
[ ] Set NODE_ENV=production
[ ] Use strong JWT_SECRET (32+ chars)
[ ] Restrict CORS origin to frontend URL only
[ ] Enable MongoDB network encryption
[ ] Use HTTPS only
[ ] Add rate limiting: npm install express-rate-limit
[ ] Implement request logging
[ ] Use environment variables for all secrets
[ ] Add database backups (MongoDB Atlas snapshots)
[ ] Monitor logs (use Render's log viewer)
```

---

## 12. Scalability Notes

### For >1000 Students:

1. **Upgrade MongoDB:** M2/M5 cluster ($0.05/hr with free credits)
2. **Add Redis caching:** For attendance/marks aggregation
3. **Enable MongoDB indexing:**
   ```javascript
   UserSchema.index({ email: 1 });
   QuizAttemptSchema.index({ userId: 1, quizId: 1 });
   ```
4. **Use PM2 clustering:**
   ```bash
   npm install -g pm2
   pm2 start index.js -i max
   ```

---

## 13. Next Steps: Real-Time Features

### Add Socket.io for Live Quizzes

```bash
npm install socket.io
```

```javascript
// In index.js
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: { origin: '*' },
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-quiz', (quizId) => {
    socket.join(`quiz-${quizId}`);
  });

  socket.on('submit-answer', (data) => {
    io.to(`quiz-${data.quizId}`).emit('answer-submitted', {
      userId: socket.id,
      timestamp: new Date(),
    });
  });
});

http.listen(PORT, () => console.log(`🎓 Backend running on port ${PORT}`));
```

---

## Conclusion

You now have a **production-ready backend** for your educational React Native app! 

**Key Takeaways:**
- MongoDB Atlas M0 (512 MB) is free forever—perfect for learning
- Render's free tier is ideal for demo/prototype deployment
- Implement all security best practices from day one
- Test thoroughly with Postman before mobile deployment
- Monitor logs in Render for debugging

**Estimated Learning Time:** 3-4 hours setup + 2-3 weeks to master all concepts

**Next Challenge:** Add WebSockets (Socket.io) for **live quizzes** and **real-time forum notifications**!

---

**Happy coding! 🚀**