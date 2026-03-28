const request = require('supertest');
const express = require('express');
const notificationsRoutes = require('../src/routes/notifications');

const app = express();
app.use(express.json());
app.use('/notifications', notificationsRoutes);

describe('Notifications Routes', () => {
  test('GET /notifications requires auth', async () => {
    const response = await request(app).get('/notifications');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});
