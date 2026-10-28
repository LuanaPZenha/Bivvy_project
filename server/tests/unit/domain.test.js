'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { calculateRentalPricing, daysBetween } = require('../../src/services/pricing');
const { distanceFromZip } = require('../../src/services/geo');
const { canTransition } = require('../../src/domain/bookingPolicy');
const { readListingInput } = require('../../src/domain/listingRules');
const { plain, isoDate } = require('../../src/security/text');
const { assertPassword } = require('../../src/security/passwords');
const { createRateLimiter } = require('../../src/security/rateLimit');
const config = require('../../src/config');

describe('pricing and dates', () => {
  it('counts whole rental days and adds fee and tax', () => {
    const quote = calculateRentalPricing({
      pricePerDay: 20,
      startDate: '2026-11-01',
      endDate: '2026-11-03',
    });
    assert.equal(quote.days, 2);
    assert.equal(quote.subtotal, 40);
    assert.ok(quote.total > quote.subtotal);
  });

  it('rejects a rental that does not span a day', () => {
    assert.throws(() => daysBetween('2026-11-01', '2026-11-01'), /after startDate/);
  });

  it('rejects impossible calendar dates', () => {
    assert.throws(() => isoDate('2026-13-40', 'startDate'), /calendar date/);
  });
});

describe('geo', () => {
  it('returns zero miles when the listing sits on the ZIP centroid', () => {
    const miles = distanceFromZip(
      { latitude: 47.651, longitude: -122.35, distanceMiles: 9 },
      '98103',
    );
    assert.equal(miles, 0);
  });

  it('keeps the stored distance when the ZIP is unknown', () => {
    const miles = distanceFromZip({ latitude: 47.6, longitude: -122.3, distanceMiles: 4.2 }, '00000');
    assert.equal(miles, 4.2);
  });
});

describe('booking policy', () => {
  const booking = { status: 'accepted', ownerId: 'owner', renterId: 'renter' };

  it('lets the owner accept and blocks the renter from paying by status patch', () => {
    const requested = { ...booking, status: 'requested' };
    assert.equal(canTransition(requested, 'owner', 'accepted').ok, true);
    assert.equal(canTransition(booking, 'renter', 'paid').ok, false);
    assert.equal(canTransition(booking, 'owner', 'paid').message, 'Payment is confirmed through checkout');
  });

  it('hides other peoples bookings', () => {
    const decision = canTransition(booking, 'stranger', 'cancelled');
    assert.equal(decision.status, 403);
  });
});

describe('listing input', () => {
  it('rejects a bad category and a non-boolean pro flag', () => {
    assert.throws(() => readListingInput({ title: 'Tent', category: 'cars', mode: 'rent', pricePerDay: 10, zipCode: '98103' }), /category/);
    const input = readListingInput({
      title: 'Tent',
      category: 'camping',
      mode: 'rent',
      pricePerDay: 10,
      zipCode: '98103',
      isPro: 'true',
    });
    assert.equal(input.isPro, false);
  });
});

describe('passwords and text', () => {
  it('requires a letter and a number', () => {
    assert.equal(assertPassword('Trail123'), 'Trail123');
    assert.throws(() => assertPassword('trailonly'), /letter and a number/);
  });

  it('strips control characters and caps length', () => {
    assert.equal(plain('Hi\u0000 there', 20), 'Hi there');
    assert.throws(() => plain('x'.repeat(21), 20), /exceeds 20/);
  });
});

describe('rate limiter', () => {
  it('blocks the third hit inside the window', () => {
    const limit = createRateLimiter({
      windowMs: 1000,
      max: 2,
      keyFn: () => 'ip',
    });
    const req = {};
    const ok = { set() {}, status() { return this; }, json() {} };
    let blocked = 0;
    const res = {
      set() {},
      status(code) {
        blocked = code;
        return this;
      },
      json() {},
    };
    limit(req, ok, () => {});
    limit(req, ok, () => {});
    limit(req, res, () => {
      throw new Error('should not pass');
    });
    assert.equal(blocked, 429);
  });
});

describe('production config', () => {
  it('refuses the development JWT secret in production', () => {
    assert.throws(
      () => config.assertProductionConfig({ nodeEnv: 'production', jwtSecret: 'dev-only-change-me-bivvy-access' }),
      /JWT_ACCESS_SECRET/,
    );
    assert.doesNotThrow(() =>
      config.assertProductionConfig({ nodeEnv: 'production', jwtSecret: 'a-unique-production-secret-value' }),
    );
  });
});
