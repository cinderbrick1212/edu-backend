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
