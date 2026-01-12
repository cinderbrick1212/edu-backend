
require('dotenv').config();
const mongoose = require('mongoose');

// ============ MODELS ============
const User = require('./models/User');
const Quiz = require('./models/Quiz');

// ============ DATABASE CONNECTION ============
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB Connected');
  seedDatabase();
})
.catch((err) => console.error('❌ MongoDB Error:', err));

const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Quiz.deleteMany({});

    console.log('🧹 Cleared existing data');

    // Create users
    const users = await User.create([
      { email: 'student@college.com', password: 'password123', role: 'student', profile: { name: 'Student User', semester: 1, branch: 'CSE' } },
      { email: 'teacher@college.com', password: 'password123', role: 'teacher', profile: { name: 'Teacher User' } },
      { email: 'admin@college.com', password: 'password123', role: 'admin', profile: { name: 'Admin User' } },
    ]);

    console.log('🙋 Created users');

    const teacher = await User.findOne({ email: 'teacher@college.com' });

    // Create a quiz
    const quiz = await Quiz.create({
      title: 'Introduction to JavaScript',
      description: 'A beginner-friendly quiz on JavaScript fundamentals.',
      createdBy: teacher._id,
      questions: [
        {
          questionText: 'What is the output of `typeof null`?',
          questionType: 'mcq',
          options: ['"object"', '"null"', '"undefined"', '"number"'],
          correctAnswer: '"object"',
          marks: 1,
        },
        {
          questionText: 'Which keyword is used to declare a constant in JavaScript?',
          questionType: 'mcq',
          options: ['let', 'var', 'const', 'static'],
          correctAnswer: 'const',
          marks: 1,
        },
      ],
      totalMarks: 2,
      timeLimit: 10,
      isPublished: true,
    });

    console.log('📝 Created a quiz');

    console.log('✅ Database seeded successfully!');
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    mongoose.connection.close();
  }
};

