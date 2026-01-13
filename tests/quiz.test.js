const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../index');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), { dbName: 'test' });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

test('Teacher can create a quiz and student can attempt it', async () => {
  // Register teacher
  const teacherRegister = await request(app)
    .post('/api/auth/register')
    .send({ email: 'teacher@edu.com', password: 'password123', role: 'teacher' })
    .expect(201);
  const teacherToken = teacherRegister.body.token;

  // Create quiz
  const quizPayload = {
    title: 'Sample Quiz',
    questions: [
      { questionText: '1+1=?', questionType: 'mcq', options: ['1','2','3'], correctAnswer: '2', marks: 1 },
    ],
  };

  const createRes = await request(app)
    .post('/api/quizzes')
    .set('Authorization', `Bearer ${teacherToken}`)
    .send(quizPayload)
    .expect(201);

  const quizId = createRes.body.quiz._id;

  // Register student and attempt
  const studentRegister = await request(app)
    .post('/api/auth/register')
    .send({ email: 'student@edu.com', password: 'password123' })
    .expect(201);
  const studentToken = studentRegister.body.token;

  const attemptRes = await request(app)
    .post(`/api/quizzes/${quizId}/attempt`)
    .set('Authorization', `Bearer ${studentToken}`)
    .send({ quizId, answers: [{ questionId: createRes.body.quiz.questions[0]._id, userAnswer: '2' }] })
    .expect(201);

  expect(attemptRes.body.attempt.score).toBe(1);
});
