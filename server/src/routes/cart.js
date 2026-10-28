'use strict';

const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const { httpError } = require('../middleware/errors');
const { calculateBuyPricing } = require('../services/pricing');
const { newId } = require('../store/memoryStore');
const { plain } = require('../security/text');

function toIsoToday() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(iso, days) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function createCartRouter(store) {
  const router = Router();

  router.post('/checkout', requireAuth, (req, res, next) => {
    try {
      const listingIds = Array.isArray(req.body.listingIds)
        ? [...new Set(req.body.listingIds.map(String))]
        : [];
      if (!listingIds.length) throw httpError(400, 'listingIds is required');
      if (listingIds.length > 20) throw httpError(400, 'Cart checkout accepts at most 20 listings');
      const message = plain(req.body.message || 'Cart checkout', 1000);
      const results = [];

      for (const listingId of listingIds) {
        const listing = store.listings.get(listingId);
        if (!listing) throw httpError(404, `Listing not found: ${listingId}`);
        if (listing.mode !== 'buy') throw httpError(400, 'Cart checkout only supports buy listings');
        if (listing.ownerId === req.user.id) {
          throw httpError(400, 'You cannot buy your own listing');
        }
        const startDate = toIsoToday();
        const booking = {
          id: newId('bkg'),
          listingId: listing.id,
          renterId: req.user.id,
          renterName: req.user.name || 'Buyer',
          ownerId: listing.ownerId,
          startDate,
          endDate: addDays(startDate, 1),
          status: 'requested',
          pricing: calculateBuyPricing({ buyPrice: listing.buyPrice }),
          message,
          payment: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        store.bookings.set(booking.id, booking);
        results.push({ booking, listing });
      }

      res.status(201).json({ count: results.length, bookings: results });
    } catch (err) {
      next(err);
    }
  });

  return router;
}

module.exports = { createCartRouter };
