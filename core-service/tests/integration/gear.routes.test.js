'use strict';

const request = require('supertest');
const { createApp } = require('../../src/app');

function futureDate(daysAhead) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + daysAhead);
  return d.toISOString().slice(0, 10);
}

describe('Core gear routes integration', () => {
  const app = createApp();

  it('GET /health', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.service).toBe('core-service');
  });

  it('GET /gear/near returns listings with mode and description', async () => {
    const res = await request(app).get('/gear/near');
    expect(res.status).toBe(200);
    expect(res.body.count).toBeGreaterThan(0);
    expect(res.body.listings[0]).toHaveProperty('mode');
    expect(res.body.listings[0]).toHaveProperty('description');
  });

  it('GET /gear/near filters by mode and query', async () => {
    const res = await request(app).get('/gear/near').query({ mode: 'rent', q: 'tent' });
    expect(res.status).toBe(200);
    expect(res.body.listings.every((l) => l.mode === 'rent')).toBe(true);
  });

  it('GET /gear/:id returns a listing', async () => {
    const res = await request(app).get('/gear/lst_tent_1');
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('4-Person Blackout Tent');
  });

  it('GET /gear/:id returns 404 for unknown ids', async () => {
    const res = await request(app).get('/gear/does-not-exist');
    expect(res.status).toBe(404);
  });

  it('POST /listings requires identity headers', async () => {
    const res = await request(app).post('/listings').send({
      title: 'Inflatable Kayak',
      category: 'water',
      pricePerDay: 35,
    });
    expect(res.status).toBe(401);
  });

  it('POST /listings creates a listing with owner identity', async () => {
    const res = await request(app)
      .post('/listings')
      .set('x-user-id', 'user_sam')
      .send({
        title: 'Inflatable Kayak',
        category: 'water',
        mode: 'rent',
        pricePerDay: 35,
        description: 'A stable day kayak.',
      });
    expect(res.status).toBe(201);
    expect(res.body.ownerId).toBe('user_sam');
  });

  it('quotes and creates bookings for authenticated renters', async () => {
    const start = futureDate(3);
    const end = futureDate(6);
    const quote = await request(app)
      .post('/gear/lst_tent_1/quote')
      .send({ startDate: start, endDate: end });
    expect(quote.status).toBe(200);
    expect(quote.body.pricing.days).toBe(3);

    const created = await request(app)
      .post('/bookings')
      .set('x-user-id', 'renter_1')
      .set('x-user-name', 'Alex R.')
      .send({ listingId: 'lst_pack_1', startDate: start, endDate: end, message: 'Weekend trek' });
    expect(created.status).toBe(201);
    expect(created.body.booking.status).toBe('requested');

    const listed = await request(app).get('/bookings').set('x-user-id', 'renter_1');
    expect(listed.status).toBe(200);
    expect(listed.body.count).toBeGreaterThan(0);
  });
});
