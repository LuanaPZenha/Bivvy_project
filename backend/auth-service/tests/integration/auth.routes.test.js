'use strict';

const request = require('supertest');
const { createApp } = require('../../src/app');

describe('Auth routes integration', () => {
  const app = createApp();

  it('GET /health', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.service).toBe('auth-service');
  });

  it('POST /auth/register then /auth/login', async () => {
    const email = `user_${Date.now()}@bivvy.test`;
    const password = 'StrongPass1!';

    const reg = await request(app).post('/auth/register').send({ email, password, name: 'Jordan' });

    expect(reg.status).toBe(201);
    expect(reg.body.accessToken).toBeDefined();
    expect(reg.body.refreshToken).toBeDefined();
    expect(reg.body.user.email).toBe(email);

    const login = await request(app).post('/auth/login').send({ email, password });
    expect(login.status).toBe(200);
    expect(login.body.accessToken).toBeDefined();
  });

  it('rejects weak password on register', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'weak@bivvy.test', password: '123' });
    expect(res.status).toBe(400);
  });
});
