'use strict';

const { Router } = require('express');
const { newId } = require('../store/memoryStore');
const { requireAuth } = require('../middleware/auth');
const { httpError } = require('../middleware/errors');
const { distanceFromZip, resolveZip } = require('../services/geo');
const { calculateRentalPricing, calculateBuyPricing } = require('../services/pricing');

const CATEGORIES = new Set(['camping', 'hiking', 'climbing', 'water', 'snow', 'bikes']);
const MODES = new Set(['rent', 'buy']);

function listingPrice(listing) {
  return listing.mode === 'buy' ? Number(listing.buyPrice) || 0 : Number(listing.pricePerDay) || 0;
}

function sortListings(listings, sortBy) {
  const sorted = [...listings];
  switch (sortBy) {
    case 'price_asc':
      return sorted.sort((a, b) => listingPrice(a) - listingPrice(b));
    case 'price_desc':
      return sorted.sort((a, b) => listingPrice(b) - listingPrice(a));
    case 'rating':
      return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    default:
      return sorted.sort((a, b) => (a.distanceMiles || 0) - (b.distanceMiles || 0));
  }
}

function validateListingInput(body, { partial = false } = {}) {
  const out = {};
  if (!partial || body.title != null) {
    out.title = String(body.title || '').trim();
    if (!out.title) throw httpError(400, 'Listing requires a title');
  }
  if (!partial || body.category != null) {
    out.category = String(body.category || 'camping').toLowerCase();
    if (!CATEGORIES.has(out.category)) throw httpError(400, 'Invalid category');
  }
  if (!partial || body.mode != null) {
    out.mode = String(body.mode || 'rent').toLowerCase();
    if (!MODES.has(out.mode)) throw httpError(400, 'Mode must be rent or buy');
  }
  if (!partial || body.description != null) {
    out.description = String(body.description || '');
  }
  if (!partial || body.zipCode != null) {
    out.zipCode = String(body.zipCode || '98103');
  }
  if (!partial || body.blockedDates != null) {
    out.blockedDates = Array.isArray(body.blockedDates)
      ? body.blockedDates.map(String)
      : [];
  }
  if (!partial || body.isPro != null) out.isPro = Boolean(body.isPro);
  if (!partial || body.pricePerDay != null) {
    out.pricePerDay = body.pricePerDay == null ? null : Number(body.pricePerDay);
  }
  if (!partial || body.buyPrice != null) {
    out.buyPrice = body.buyPrice == null ? null : Number(body.buyPrice);
  }
  return out;
}

function createListingsRouter(store) {
  const router = Router();

  router.get('/mine', requireAuth, (req, res) => {
    const listings = [...store.listings.values()].filter((l) => l.ownerId === req.user.id);
    res.json({ count: listings.length, listings });
  });

  router.get('/near', (req, res) => {
    const category = String(req.query.category || 'all').toLowerCase();
    const mode = String(req.query.mode || 'all').toLowerCase();
    const q = String(req.query.q || req.query.query || '')
      .trim()
      .toLowerCase();
    const maxDistance = Number(req.query.maxDistance) || 25;
    const zipCode = req.query.zip || req.query.zipCode || null;
    const sortBy = String(req.query.sort || req.query.sortBy || 'distance').toLowerCase();

    let listings = [...store.listings.values()].map((listing) => {
      const distanceMiles = zipCode ? distanceFromZip(listing, zipCode) : listing.distanceMiles;
      return { ...listing, distanceMiles };
    });

    listings = listings.filter((listing) => {
      const catOk = category === 'all' || listing.category === category;
      const modeOk = mode === 'all' || listing.mode === mode;
      const distOk = listing.distanceMiles <= maxDistance;
      const queryOk =
        !q ||
        listing.title.toLowerCase().includes(q) ||
        listing.description.toLowerCase().includes(q) ||
        (listing.location || '').toLowerCase().includes(q);
      return catOk && modeOk && distOk && queryOk;
    });

    listings = sortListings(listings, sortBy);
    res.json({ count: listings.length, zipCode, sortBy, listings });
  });

  router.get('/:id/reviews', (req, res, next) => {
    try {
      const listing = store.listings.get(req.params.id);
      if (!listing) throw httpError(404, 'Listing not found');
      const reviews = [...store.reviews.values()]
        .filter((r) => r.listingId === listing.id)
        .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
      res.json({ listingId: listing.id, count: reviews.length, reviews });
    } catch (err) {
      next(err);
    }
  });

  router.get('/:id', (req, res, next) => {
    try {
      const listing = store.listings.get(req.params.id);
      if (!listing) throw httpError(404, 'Listing not found');
      res.json(listing);
    } catch (err) {
      next(err);
    }
  });

  router.post('/:id/quote', (req, res, next) => {
    try {
      const listing = store.listings.get(req.params.id);
      if (!listing) throw httpError(404, 'Listing not found');
      let pricing;
      if (listing.mode === 'buy') {
        pricing = calculateBuyPricing({ buyPrice: listing.buyPrice });
      } else {
        const { startDate, endDate } = req.body || {};
        if (!startDate || !endDate) throw httpError(400, 'startDate and endDate are required');
        pricing = calculateRentalPricing({
          pricePerDay: listing.pricePerDay,
          startDate,
          endDate,
        });
      }
      res.json({
        listingId: listing.id,
        mode: listing.mode,
        startDate: req.body?.startDate,
        endDate: req.body?.endDate,
        pricing,
      });
    } catch (err) {
      next(err);
    }
  });

  router.post('/', requireAuth, (req, res, next) => {
    try {
      const input = validateListingInput(req.body);
      if (input.mode === 'rent') {
        if (input.pricePerDay == null || Number.isNaN(input.pricePerDay) || input.pricePerDay < 0) {
          throw httpError(400, 'Rent listings require pricePerDay');
        }
        input.buyPrice = null;
      } else {
        if (input.buyPrice == null || Number.isNaN(input.buyPrice) || input.buyPrice < 0) {
          throw httpError(400, 'Buy listings require buyPrice');
        }
        input.pricePerDay = null;
      }
      const geo = resolveZip(input.zipCode);
      const listing = {
        id: newId('lst'),
        title: input.title,
        category: input.category,
        mode: input.mode,
        pricePerDay: input.pricePerDay,
        buyPrice: input.buyPrice,
        distanceMiles: 0,
        rating: 0,
        reviewCount: 0,
        ownerName: req.user.name || 'You',
        ownerId: req.user.id,
        isPro: Boolean(input.isPro),
        location: geo?.label || 'Seattle, WA',
        zipCode: input.zipCode,
        latitude: geo?.lat || 47.61,
        longitude: geo?.lng || -122.33,
        thumbnailTone: 'forest',
        description: input.description || '',
        blockedDates: input.blockedDates || [],
        images: [],
      };
      store.listings.set(listing.id, listing);
      res.status(201).json(listing);
    } catch (err) {
      next(err);
    }
  });

  router.patch('/:id', requireAuth, (req, res, next) => {
    try {
      const existing = store.listings.get(req.params.id);
      if (!existing) throw httpError(404, 'Listing not found');
      if (existing.ownerId !== req.user.id) throw httpError(403, 'Forbidden');
      const input = validateListingInput(req.body, { partial: true });
      const nextListing = { ...existing, ...input };
      if (nextListing.mode === 'rent') {
        if (nextListing.pricePerDay == null) throw httpError(400, 'Rent listings require pricePerDay');
        nextListing.buyPrice = null;
      } else {
        if (nextListing.buyPrice == null) throw httpError(400, 'Buy listings require buyPrice');
        nextListing.pricePerDay = null;
      }
      if (input.zipCode) {
        const geo = resolveZip(input.zipCode);
        if (geo) {
          nextListing.location = geo.label;
          nextListing.latitude = geo.lat;
          nextListing.longitude = geo.lng;
        }
      }
      store.listings.set(nextListing.id, nextListing);
      res.json(nextListing);
    } catch (err) {
      next(err);
    }
  });

  router.delete('/:id', requireAuth, (req, res, next) => {
    try {
      const existing = store.listings.get(req.params.id);
      if (!existing) throw httpError(404, 'Listing not found');
      if (existing.ownerId !== req.user.id) throw httpError(403, 'Forbidden');
      store.listings.delete(existing.id);
      res.json({ deleted: true, id: existing.id });
    } catch (err) {
      next(err);
    }
  });

  router.post('/:id/reviews', requireAuth, (req, res, next) => {
    try {
      const listing = store.listings.get(req.params.id);
      if (!listing) throw httpError(404, 'Listing not found');
      const bookingId = String(req.body.bookingId || '');
      const booking = store.bookings.get(bookingId);
      if (!booking || booking.listingId !== listing.id) {
        throw httpError(400, 'A completed booking for this listing is required');
      }
      if (booking.renterId !== req.user.id) throw httpError(403, 'Only the renter can review');
      if (booking.status !== 'completed') {
        throw httpError(400, 'Reviews are only allowed after completion');
      }
      for (const review of store.reviews.values()) {
        if (review.bookingId === bookingId) throw httpError(409, 'Booking already reviewed');
      }
      const rating = Number(req.body.rating);
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        throw httpError(400, 'Rating must be an integer from 1 to 5');
      }
      const review = {
        id: newId('rev'),
        listingId: listing.id,
        bookingId,
        reviewerId: req.user.id,
        reviewerName: req.user.name || 'Renter',
        rating,
        comment: String(req.body.comment || '').trim().slice(0, 1000),
        createdAt: new Date().toISOString(),
      };
      store.reviews.set(review.id, review);

      const all = [...store.reviews.values()].filter((r) => r.listingId === listing.id);
      listing.reviewCount = all.length;
      listing.rating =
        Math.round((all.reduce((s, r) => s + r.rating, 0) / all.length) * 10) / 10;
      store.listings.set(listing.id, listing);
      res.status(201).json(review);
    } catch (err) {
      next(err);
    }
  });

  return router;
}

module.exports = { createListingsRouter };
