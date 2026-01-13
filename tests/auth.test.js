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

test('Register and login flow', async () => {
  const resRegister = await request(app)
    .post('/api/auth/register')
    .send({ email: 'test@edu.com', password: 'password123' })
    .expect(201);
  expect(resRegister.body).toHaveProperty('token');

  const resLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: 'test@edu.com', password: 'password123' })
    .expect(200);
  expect(resLogin.body).toHaveProperty('token');
});
