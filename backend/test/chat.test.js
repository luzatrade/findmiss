const request = require('supertest');
const express = require('express');
const chatRoutes = require('../src/routes/chat');

const app = express();
app.use(express.json());
app.use('/chat', chatRoutes);

describe('Chat Routes', () => {
  test('GET /chat/conversations requires auth', async () => {
    const response = await request(app).get('/chat/conversations');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});
