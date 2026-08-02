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

  it('POST /auth/google with mocked verifier returns tokens', async () => {
    const googleApp = createApp({
      googleTokenVerifier: {
        verify: async () => ({
          email: 'google.user@bivvy.test',
          emailVerified: true,
          name: 'Google User',
          sub: 'sub-123',
        }),
      },
    });

    const res = await request(googleApp).post('/auth/google').send({ idToken: 'test-id-token' });
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('google.user@bivvy.test');
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
  });
});

