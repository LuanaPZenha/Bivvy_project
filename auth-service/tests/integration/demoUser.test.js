'use strict';

const request = require('supertest');
const { createApp } = require('../../src/app');
const { DEFAULT_EMAIL, DEFAULT_PASSWORD } = require('../../src/infrastructure/persistence/seedDemoUser');

describe('Demo user seed', () => {
  it('allows signing in with the seeded demo account', async () => {
    const app = createApp();
    await app.locals.ready;

    const res = await request(app).post('/auth/login').send({
      email: DEFAULT_EMAIL,
      password: DEFAULT_PASSWORD,
    });

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(DEFAULT_EMAIL);
    expect(res.body.accessToken).toBeDefined();
  });
});
