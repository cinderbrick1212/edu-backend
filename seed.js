
require('dotenv').config();
const mongoose = require('mongoose');

// ============ MODELS ============
const User = require('./models/User');
const Quiz = require('./models/Quiz');
const Attendance = require('./models/Attendance');
const Marks = require('./models/Marks');

// ============ DATABASE CONNECTION ============
mongoose.connect(process.env.MONGODB_URI)
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
    await Attendance.deleteMany({});
    await Marks.deleteMany({});

    console.log('🧹 Cleared existing data');

    // Create users
    const users = await User.create([
      { email: 'student@college.com', password: 'password123', role: 'student', profile: { name: 'Legacy Student', semester: 2, branch: 'CSE' } },
      { email: 'teacher@college.com', password: 'password123', role: 'teacher', profile: { name: 'Teacher User' } },
      { email: 'admin@college.com', password: 'password123', role: 'admin', profile: { name: 'Admin User' } },
      { email: 'new_student@college.com', password: 'password123', role: 'student', profile: { name: 'New Student', semester: 1, branch: 'ECE' } },
      { email: 'daily_student@college.com', password: 'password123', role: 'student', profile: { name: 'Daily Student', semester: 3, branch: 'CSE' } },
    ]);

    console.log('🙋 Created users (Added New and Daily users)');

    const dailyStudent = await User.findOne({ email: 'daily_student@college.com' });
    const teacher = await User.findOne({ email: 'teacher@college.com' });

    // Populate Daily Student with Attendance (High attendance: ~90%)
    const attendanceRecords = [];
    for (let i = 0; i < 20; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      attendanceRecords.push({
        userId: dailyStudent._id,
        date: date,
        status: i === 5 || i === 12 ? 'absent' : 'present',
        classId: 'CSE-101',
        remarks: 'Regular Session'
      });
    }
    await Attendance.insertMany(attendanceRecords);
    console.log('📅 Added 20 attendance records for Daily Student');

    // Populate Daily Student with Marks
    await Marks.create([
      { userId: dailyStudent._id, subject: 'Data Structures', marks: 85, totalMarks: 100, percentage: 85, examType: 'midterm' },
      { userId: dailyStudent._id, subject: 'Algorithms', marks: 92, totalMarks: 100, percentage: 92, examType: 'quiz' },
      { userId: dailyStudent._id, subject: 'Database Management', marks: 78, totalMarks: 100, percentage: 78, examType: 'assignment' },
    ]);
    console.log('📊 Added marks history for Daily Student');

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
    console.log('--------------------------------------------------');
    console.log('TEST CREDENTIALS:');
    console.log('1. New User: new_student@college.com / password123');
    console.log('2. Daily User: daily_student@college.com / password123');
    console.log('--------------------------------------------------');

    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    mongoose.connection.close();
  }
};

