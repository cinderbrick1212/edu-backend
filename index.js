require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// ============ MIDDLEWARE ============
app.use(helmet()); // Security headers
app.use(require('./middleware/rateLimiter'));
app.use(morgan('combined')); // Logging
app.use(express.json());
app.use(express.urlencoded({ limit: '10mb', extended: true }));
const allowedOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000', 'http://localhost:19006', 'http://127.0.0.1:19006', 'http://192.168.x.x:5000'];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (mobile apps, curl, native clients)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'), false);
    }
  },
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
app.use('/health', require('./routes/healthRoutes'));

// ============ HEALTH CHECK ============
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Backend running 🚀', timestamp: new Date() });
});

// Root route (useful for browsers / basic checks)
app.get('/', (req, res) => {
  res.status(200).json({ success: true, message: 'Backend running 🚀', uptime: process.uptime() });
});

// 404 handler for unmatched routes
app.use((req, res, next) => {
  res.status(404).json({ success: false, error: 'Not Found' });
});

// ============ ERROR HANDLING ============
app.use(require('./middleware/errorHandler'));

// ============ DATABASE CONNECTION ============
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Connected'))
.catch((err) => console.error('❌ MongoDB Error:', err));

// ============ START SERVER ============
const PORT = process.env.PORT || 5000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🎓 Backend running on http://localhost:${PORT}`);
  });
}

module.exports = app;
