const request = require('supertest');
const express = require('express');
const uploadRoutes = require('../src/routes/upload');

const app = express();
app.use(express.json());
app.use('/upload', uploadRoutes);

describe('Upload Routes', () => {
  test('POST /upload requires auth', async () => {
    const response = await request(app)
      .post('/upload')
      .field('type', 'image');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});
