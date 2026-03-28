const request = require('supertest');
const express = require('express');
const announcementsRoutes = require('../src/routes/announcements');

const app = express();
app.use(express.json());
app.use('/announcements', announcementsRoutes);

describe('Announcements Routes', () => {
  test('POST /announcements/:id/contact requires auth', async () => {
    const response = await request(app)
      .post('/announcements/test-announcement/contact')
      .send({});

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});
