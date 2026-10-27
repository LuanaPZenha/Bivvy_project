'use strict';

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { bootstrapApp } = require('../src/app');

describe('Bivvy API', () => {
  let app;
  let server;
  let baseUrl;

  async function request(method, path, { body, token } = {}) {
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
      json = { raw: text };
    }
    return { status: res.status, json };
  }

  before(async () => {
    process.env.NODE_ENV = 'test';
    app = await bootstrapApp();
    await new Promise((resolve) => {
      server = app.listen(0, '127.0.0.1', resolve);
    });
    const { port } = server.address();
    baseUrl = `http://127.0.0.1:${port}`;
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it('health', async () => {
    const res = await request('GET', '/health');
    assert.equal(res.status, 200);
    assert.equal(res.json.service, 'bivvy-server');
  });

  it('lists nearby gear sorted by price', async () => {
    const res = await request('GET', '/api/gear/near?mode=rent&sort=price_asc');
    assert.equal(res.status, 200);
    assert.ok(res.json.count > 0);
    const prices = res.json.listings.map((l) => l.pricePerDay);
    assert.deepEqual(prices, [...prices].sort((a, b) => a - b));
  });

  it('registers, creates listing, books, pays, completes, reviews, chats', async () => {
    const email = `camper_${Date.now()}@bivvy.test`;
    const reg = await request('POST', '/api/auth/register', {
      body: {
        email,
        password: 'Password123',
        name: 'Test Camper',
        acceptTerms: true,
      },
    });
    assert.equal(reg.status, 201);
    const token = reg.json.accessToken;

    const ownerReg = await request('POST', '/api/auth/register', {
      body: {
        email: `owner_${Date.now()}@bivvy.test`,
        password: 'Password123',
        name: 'Test Owner',
        acceptTerms: true,
      },
    });
    const ownerToken = ownerReg.json.accessToken;

    const created = await request('POST', '/api/listings', {
      token: ownerToken,
      body: {
        title: 'Test Tent',
        category: 'camping',
        mode: 'rent',
        pricePerDay: 20,
        description: 'Demo',
        zipCode: '98103',
      },
    });
    assert.equal(created.status, 201);
    const listingId = created.json.id;

    const start = new Date();
    start.setUTCDate(start.getUTCDate() + 3);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 2);
    const startDate = start.toISOString().slice(0, 10);
    const endDate = end.toISOString().slice(0, 10);

    const booked = await request('POST', '/api/bookings', {
      token,
      body: { listingId, startDate, endDate, message: 'Need it' },
    });
    assert.equal(booked.status, 201);
    const bookingId = booked.json.booking.id;

    const accepted = await request('PATCH', `/api/bookings/${bookingId}`, {
      token: ownerToken,
      body: { status: 'accepted' },
    });
    assert.equal(accepted.status, 200);

    const paid = await request('POST', `/api/bookings/${bookingId}/checkout`, {
      token,
      body: {},
    });
    assert.equal(paid.status, 200);
    assert.equal(paid.json.booking.status, 'paid');

    const msg = await request('POST', `/api/bookings/${bookingId}/messages`, {
      token: ownerToken,
      body: { body: 'Pickup at 9am by the Fremont bridge.' },
    });
    assert.equal(msg.status, 201);

    const completed = await request('PATCH', `/api/bookings/${bookingId}`, {
      token: ownerToken,
      body: { status: 'completed' },
    });
    assert.equal(completed.status, 200);

    const review = await request('POST', `/api/listings/${listingId}/reviews`, {
      token,
      body: { bookingId, rating: 5, comment: 'Great gear' },
    });
    assert.equal(review.status, 201);
  });
});
