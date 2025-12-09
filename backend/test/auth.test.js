const request = require('supertest');
const express = require('express');
const authRoutes = require('../src/routes/auth');

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

describe('Auth Routes', () => {
  test('POST /auth/register should validate input', async () => {
    const invalidData = {
      email: 'invalid-email',
      password: '123', // too short
      nickname: 'a' // too short
    };

    const response = await request(app)
      .post('/auth/register')
      .send(invalidData);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.details).toBeDefined();
  });

  test('POST /auth/register should reject invalid email format', async () => {
    const invalidData = {
      email: 'not-an-email',
      password: 'validpassword123'
    };

    const response = await request(app)
      .post('/auth/register')
      .send(invalidData);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
