'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const request = require('supertest');
const { createApp } = require('../../src/app');
const { LocalImageStore } = require('../../src/infrastructure/storage/LocalImageStore');
const {
  InMemoryListingRepository,
} = require('../../src/infrastructure/persistence/InMemoryListingRepository');
const { DEMO_PNG } = require('../../src/infrastructure/storage/seedDemoImages');

describe('listing images + cart checkout', () => {
  let app;
  let uploadDir;
  let listingRepository;

  beforeEach(() => {
    uploadDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bivvy-uploads-'));
    listingRepository = new InMemoryListingRepository();
    const imageStore = new LocalImageStore({ rootDir: uploadDir });
    app = createApp({
      listingRepository,
      imageStore,
      uploadDir,
      skipDemoImages: true,
    });
  });

  afterEach(() => {
    fs.rmSync(uploadDir, { recursive: true, force: true });
  });

  test('owner can upload an image and public can fetch it', async () => {
    const create = await request(app)
      .post('/listings')
      .set('x-user-id', 'owner_1')
      .set('x-user-name', 'Owner One')
      .send({
        title: 'Test Tent',
        category: 'camping',
        mode: 'rent',
        pricePerDay: 20,
      })
      .expect(201);

    const listingId = create.body.id;
    const upload = await request(app)
      .post(`/listings/${listingId}/images`)
      .set('x-user-id', 'owner_1')
      .attach('image', DEMO_PNG, { filename: 'demo.png', contentType: 'image/png' })
      .expect(201);

    expect(upload.body.image.id).toBeTruthy();
    expect(upload.body.images).toHaveLength(1);

    const listed = await request(app).get(`/gear/${listingId}/images`).expect(200);
    expect(listed.body.count).toBe(1);

    const binary = await request(app)
      .get(`/gear/${listingId}/images/${upload.body.image.id}`)
      .expect(200);
    expect(binary.headers['content-type']).toMatch(/image\/png/);
    expect(Buffer.isBuffer(binary.body) || binary.body.length > 0).toBeTruthy();
  });

  test('non-owner cannot upload', async () => {
    await request(app)
      .post('/listings/lst_tent_1/images')
      .set('x-user-id', 'someone_else')
      .attach('image', DEMO_PNG, { filename: 'demo.png', contentType: 'image/png' })
      .expect(403);
  });

  test('cart checkout creates buy bookings only', async () => {
    const res = await request(app)
      .post('/cart/checkout')
      .set('x-user-id', 'buyer_1')
      .set('x-user-name', 'Buyer')
      .send({ listingIds: ['lst_stove_1', 'lst_draws_1'], message: 'Bundle pickup' })
      .expect(201);

    expect(res.body.count).toBe(2);
    expect(res.body.bookings[0].booking.status).toBe('requested');
    expect(res.body.bookings[0].listing.mode).toBe('buy');
  });

  test('cart checkout rejects rent listings', async () => {
    await request(app)
      .post('/cart/checkout')
      .set('x-user-id', 'buyer_1')
      .send({ listingIds: ['lst_tent_1'] })
      .expect(400);
  });
});
