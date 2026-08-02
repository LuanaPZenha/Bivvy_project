'use strict';

const request = require('supertest');
const { createApp } = require('../../src/app');
const { DEFAULT_EMAIL, DEFAULT_PASSWORD } = require('../../src/infrastructure/persistence/seedDemoUser');

describe('Demo user seed', () => {
  it('allows signing in with the seeded demo account', async () => {
    const app = createApp();

    // Seeding is async at startup; retry briefly until the hash is stored.
    let res;
    for (let attempt = 0; attempt < 10; attempt += 1) {
      res = await request(app).post('/auth/login').send({
        email: DEFAULT_EMAIL,
        password: DEFAULT_PASSWORD,
      });
      if (res.status === 200) break;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(DEFAULT_EMAIL);
    expect(res.body.accessToken).toBeDefined();
  });
});
