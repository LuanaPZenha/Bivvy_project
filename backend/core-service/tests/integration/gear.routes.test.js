'use strict';

const request = require('supertest');
const { createApp } = require('../../src/app');

describe('Core gear routes integration', () => {
  const app = createApp();

  it('GET /health', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.service).toBe('core-service');
  });

  it('GET /gear/near returns listings', async () => {
    const res = await request(app).get('/gear/near');
    expect(res.status).toBe(200);
    expect(res.body.count).toBeGreaterThan(0);
    expect(Array.isArray(res.body.listings)).toBe(true);
  });

  it('POST /listings creates a listing', async () => {
    const res = await request(app).post('/listings').send({
      title: 'Inflatable Kayak',
      category: 'water',
      pricePerDay: 35,
      distanceMiles: 2.1,
      ownerName: 'Sam R.',
    });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Inflatable Kayak');
  });
});
