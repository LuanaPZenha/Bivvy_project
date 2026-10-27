'use strict';

const crypto = require('crypto');
const { Router } = require('express');
const { newId } = require('../store/memoryStore');
const { requireAuth } = require('../middleware/auth');
const { httpError } = require('../middleware/errors');
const { calculateRentalPricing, calculateBuyPricing } = require('../services/pricing');

const OWNER_STATUSES = new Set(['accepted', 'declined', 'completed']);
const TRANSITIONS = {
  requested: ['accepted', 'declined', 'cancelled'],
  accepted: ['paid', 'cancelled', 'completed'],
  paid: ['completed', 'cancelled'],
  declined: [],
  cancelled: [],
  completed: [],
};

function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

function toIsoToday() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(iso, days) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function enrichBooking(store, booking) {
  const listing = store.listings.get(booking.listingId);
  return {
    ...booking,
    listing: listing
      ? {
          id: listing.id,
          title: listing.title,
          mode: listing.mode,
          category: listing.category,
          thumbnailTone: listing.thumbnailTone,
          ownerName: listing.ownerName,
        }
      : null,
  };
}

function createBookingsRouter(store) {
  const router = Router();

  router.get('/', requireAuth, (req, res) => {
    const bookings = [...store.bookings.values()]
      .filter((b) => b.renterId === req.user.id || b.ownerId === req.user.id)
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
      .map((b) => enrichBooking(store, b));
    res.json({ count: bookings.length, bookings });
  });

  router.post('/', requireAuth, (req, res, next) => {
    try {
      const listingId = String(req.body.listingId || '');
      const listing = store.listings.get(listingId);
      if (!listing) throw httpError(404, 'Listing not found');
      if (listing.ownerId === req.user.id) throw httpError(400, 'You cannot book your own listing');

      let startDate;
      let endDate;
      let pricing;
      if (listing.mode === 'buy') {
        pricing = calculateBuyPricing({ buyPrice: listing.buyPrice });
        startDate = toIsoToday();
        endDate = addDays(startDate, 1);
      } else {
        startDate = String(req.body.startDate || '');
        endDate = String(req.body.endDate || '');
        if (!startDate || !endDate) throw httpError(400, 'startDate and endDate are required');
        if ((listing.blockedDates || []).some((d) => d >= startDate && d < endDate)) {
          throw httpError(409, 'Selected dates include blocked availability');
        }
        for (const existing of store.bookings.values()) {
          if (
            existing.listingId === listing.id &&
            ['requested', 'accepted', 'paid'].includes(existing.status) &&
            rangesOverlap(existing.startDate, existing.endDate, startDate, endDate)
          ) {
            throw httpError(409, 'Dates overlap an existing booking');
          }
        }
        pricing = calculateRentalPricing({
          pricePerDay: listing.pricePerDay,
          startDate,
          endDate,
        });
      }

      const booking = {
        id: newId('bkg'),
        listingId: listing.id,
        renterId: req.user.id,
        renterName: req.user.name || 'Renter',
        ownerId: listing.ownerId,
        startDate,
        endDate,
        status: 'requested',
        pricing,
        message: String(req.body.message || '').trim().slice(0, 1000),
        payment: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      store.bookings.set(booking.id, booking);
      res.status(201).json({ booking: enrichBooking(store, booking), listing });
    } catch (err) {
      next(err);
    }
  });

  router.patch('/:id', requireAuth, (req, res, next) => {
    try {
      const booking = store.bookings.get(req.params.id);
      if (!booking) throw httpError(404, 'Booking not found');
      const isOwner = booking.ownerId === req.user.id;
      const isRenter = booking.renterId === req.user.id;
      if (!isOwner && !isRenter) throw httpError(403, 'Forbidden');

      const status = String(req.body.status || '').toLowerCase();
      if (OWNER_STATUSES.has(status) && !isOwner) {
        throw httpError(403, 'Only the owner can update booking to this status');
      }
      const allowed = TRANSITIONS[booking.status] || [];
      if (!allowed.includes(status)) {
        throw httpError(400, `Cannot transition booking from ${booking.status} to ${status}`);
      }
      booking.status = status;
      booking.updatedAt = new Date().toISOString();
      store.bookings.set(booking.id, booking);
      res.json(enrichBooking(store, booking));
    } catch (err) {
      next(err);
    }
  });

  router.post('/:id/checkout/intent', requireAuth, (req, res, next) => {
    try {
      const booking = store.bookings.get(req.params.id);
      if (!booking) throw httpError(404, 'Booking not found');
      if (booking.renterId !== req.user.id) throw httpError(403, 'Only the renter can check out');
      if (booking.status !== 'accepted') throw httpError(400, 'Checkout requires an accepted booking');
      const intentId = `sim_pi_${crypto.randomBytes(8).toString('hex')}`;
      booking.pendingIntentId = intentId;
      store.bookings.set(booking.id, booking);
      res.json({
        bookingId: booking.id,
        provider: 'bivvy_sim',
        intentId,
        clientSecret: `${intentId}_secret_sim`,
        amount: booking.pricing.total,
        currency: booking.pricing.currency || 'USD',
        status: 'requires_confirmation',
      });
    } catch (err) {
      next(err);
    }
  });

  router.post('/:id/checkout', requireAuth, (req, res, next) => {
    try {
      const booking = store.bookings.get(req.params.id);
      if (!booking) throw httpError(404, 'Booking not found');
      if (booking.renterId !== req.user.id) throw httpError(403, 'Only the renter can check out');
      if (booking.status !== 'accepted') throw httpError(400, 'Checkout requires an accepted booking');

      let intentId = req.body?.intentId || booking.pendingIntentId;
      if (!intentId) {
        intentId = `sim_pi_${crypto.randomBytes(8).toString('hex')}`;
      }

      booking.payment = {
        provider: 'bivvy_sim',
        status: 'succeeded',
        currency: booking.pricing.currency || 'USD',
        amount: booking.pricing.total,
        transactionId: intentId,
        paidAt: new Date().toISOString(),
      };
      booking.status = 'paid';
      booking.pendingIntentId = null;
      booking.updatedAt = new Date().toISOString();
      store.bookings.set(booking.id, booking);
      res.json({
        booking: enrichBooking(store, booking),
        message: 'Payment simulated successfully',
      });
    } catch (err) {
      next(err);
    }
  });

  router.get('/:id/messages', requireAuth, (req, res, next) => {
    try {
      const booking = store.bookings.get(req.params.id);
      if (!booking) throw httpError(404, 'Booking not found');
      if (booking.renterId !== req.user.id && booking.ownerId !== req.user.id) {
        throw httpError(403, 'Forbidden');
      }
      const messages = [...store.messages.values()]
        .filter((m) => m.bookingId === booking.id)
        .sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));
      res.json({ bookingId: booking.id, count: messages.length, messages });
    } catch (err) {
      next(err);
    }
  });

  router.post('/:id/messages', requireAuth, (req, res, next) => {
    try {
      const booking = store.bookings.get(req.params.id);
      if (!booking) throw httpError(404, 'Booking not found');
      if (booking.renterId !== req.user.id && booking.ownerId !== req.user.id) {
        throw httpError(403, 'Forbidden');
      }
      const body = String(req.body.body || '').trim();
      if (!body) throw httpError(400, 'Message body is required');
      if (body.length > 2000) throw httpError(400, 'Message body is too long');
      const message = {
        id: newId('msg'),
        bookingId: booking.id,
        listingId: booking.listingId,
        senderId: req.user.id,
        senderName: req.user.name || 'Member',
        body,
        createdAt: new Date().toISOString(),
      };
      store.messages.set(message.id, message);
      res.status(201).json(message);
    } catch (err) {
      next(err);
    }
  });

  return router;
}

module.exports = { createBookingsRouter };
