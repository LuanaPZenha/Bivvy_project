'use strict';

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { bootstrapApp } = require('../src/app');
const { createRateLimiter } = require('../src/security/rateLimit');

async function listen(app) {
  const server = await new Promise((resolve) => {
    const httpServer = app.listen(0, '127.0.0.1', () => resolve(httpServer));
  });
  const { port } = server.address();
  return { server, baseUrl: `http://127.0.0.1:${port}` };
}

async function request(baseUrl, method, path, { body, token } = {}) {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  return { status: res.status, json, text, headers: res.headers };
}

describe('OWASP API controls', () => {
  let server;
  let baseUrl;

  before(async () => {
    process.env.NODE_ENV = 'test';
    const app = await bootstrapApp();
    ({ server, baseUrl } = await listen(app));
  });

  after(async () => {
    if (server) await new Promise((resolve) => server.close(resolve));
  });

  it('sends a content security policy and nosniff', async () => {
    const res = await request(baseUrl, 'GET', '/health');
    const csp = res.headers.get('content-security-policy');
    assert.match(csp, /default-src 'self'/);
    assert.match(csp, /script-src 'self'/);
    assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(res.headers.get('x-powered-by'), null);
  });

  it('does not leak server files through the static fallback', async () => {
    const res = await request(baseUrl, 'GET', '/server/package.json');
    assert.doesNotMatch(res.text, /jsonwebtoken/);
    assert.match(res.text, /id="app"/);
  });

  it('rejects weak passwords, ignores a client role, and omits the hash', async () => {
    const weak = await request(baseUrl, 'POST', '/api/auth/register', {
      body: { email: 'weak@bivvy.test', password: 'longpassword', name: 'A', acceptTerms: true },
    });
    assert.equal(weak.status, 400);

    const reg = await request(baseUrl, 'POST', '/api/auth/register', {
      body: {
        email: `safe_${Date.now()}@bivvy.test`,
        password: 'Trail1234',
        name: 'Safe <script>',
        role: 'admin',
        acceptTerms: true,
      },
    });
    assert.equal(reg.status, 201);
    assert.equal(reg.json.user.role, 'both');
    assert.equal(reg.json.user.passwordHash, undefined);
    assert.equal(reg.json.passwordHash, undefined);
  });

  it('rejects a tampered token', async () => {
    const reg = await request(baseUrl, 'POST', '/api/auth/register', {
      body: { email: `tok_${Date.now()}@bivvy.test`, password: 'Trail1234', name: 'Tok', acceptTerms: true },
    });
    const token = `${reg.json.accessToken.slice(0, -2)}xx`;
    const me = await request(baseUrl, 'GET', '/api/auth/me', { token });
    assert.equal(me.status, 401);
  });

  it('blocks broken access control on listings, bookings, and chat', async () => {
    const owner = await request(baseUrl, 'POST', '/api/auth/register', {
      body: { email: `own_${Date.now()}@bivvy.test`, password: 'Trail1234', name: 'Owner', acceptTerms: true },
    });
    const renter = await request(baseUrl, 'POST', '/api/auth/register', {
      body: { email: `rent_${Date.now()}@bivvy.test`, password: 'Trail1234', name: 'Renter', acceptTerms: true },
    });
    const stranger = await request(baseUrl, 'POST', '/api/auth/register', {
      body: { email: `str_${Date.now()}@bivvy.test`, password: 'Trail1234', name: 'Stranger', acceptTerms: true },
    });
    const created = await request(baseUrl, 'POST', '/api/listings', {
      token: owner.json.accessToken,
      body: {
        title: 'Locked Tent',
        category: 'camping',
        mode: 'rent',
        pricePerDay: 25,
        zipCode: '98103',
        description: '<script>alert(1)</script>',
      },
    });
    assert.equal(created.status, 201);
    assert.equal(created.json.passwordHash, undefined);
    const listingId = created.json.id;

    const removed = await request(baseUrl, 'DELETE', `/api/listings/${listingId}`, {
      token: stranger.json.accessToken,
    });
    assert.equal(removed.status, 403);

    const selfBook = await request(baseUrl, 'POST', '/api/bookings', {
      token: owner.json.accessToken,
      body: { listingId, startDate: '2026-12-01', endDate: '2026-12-03' },
    });
    assert.equal(selfBook.status, 400);

    const booked = await request(baseUrl, 'POST', '/api/bookings', {
      token: renter.json.accessToken,
      body: { listingId, startDate: '2026-12-01', endDate: '2026-12-03', message: '<script>nope</script>' },
    });
    assert.equal(booked.status, 201);
    const bookingId = booked.json.booking.id;

    const sneak = await request(baseUrl, 'PATCH', `/api/bookings/${bookingId}`, {
      token: renter.json.accessToken,
      body: { status: 'accepted' },
    });
    assert.equal(sneak.status, 403);

    const accepted = await request(baseUrl, 'PATCH', `/api/bookings/${bookingId}`, {
      token: owner.json.accessToken,
      body: { status: 'accepted' },
    });
    assert.equal(accepted.status, 200);

    const fakePay = await request(baseUrl, 'PATCH', `/api/bookings/${bookingId}`, {
      token: renter.json.accessToken,
      body: { status: 'paid' },
    });
    assert.equal(fakePay.status, 400);

    const ownerCheckout = await request(baseUrl, 'POST', `/api/bookings/${bookingId}/checkout`, {
      token: owner.json.accessToken,
      body: {},
    });
    assert.equal(ownerCheckout.status, 403);

    const chat = await request(baseUrl, 'GET', `/api/bookings/${bookingId}/messages`, {
      token: stranger.json.accessToken,
    });
    assert.equal(chat.status, 403);

    const unauthenticated = await request(baseUrl, 'POST', '/api/listings', {
      body: { title: 'Nope', category: 'camping', mode: 'rent', pricePerDay: 1, zipCode: '98103' },
    });
    assert.equal(unauthenticated.status, 401);
  });
});

describe('auth rate limit', () => {
  let server;
  let baseUrl;

  before(async () => {
    process.env.NODE_ENV = 'test';
    const app = await bootstrapApp({
      authRateLimit: createRateLimiter({ windowMs: 60_000, max: 2, keyFn: (req) => req.ip }),
    });
    ({ server, baseUrl } = await listen(app));
  });

  after(async () => {
    if (server) await new Promise((resolve) => server.close(resolve));
  });

  it('returns 429 after repeated login attempts', async () => {
    const body = { email: 'demo@bivvy.test', password: 'wrong-password-1' };
    const first = await request(baseUrl, 'POST', '/api/auth/login', { body });
    const second = await request(baseUrl, 'POST', '/api/auth/login', { body });
    const third = await request(baseUrl, 'POST', '/api/auth/login', { body });
    assert.equal(first.status, 401);
    assert.equal(second.status, 401);
    assert.equal(third.status, 429);
    assert.ok(third.headers.get('retry-after'));
  });
});
