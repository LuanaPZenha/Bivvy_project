'use strict';

const crypto = require('crypto');
const { Booking, parseIsoDate, toIsoDate } = require('../../domain/entities/Booking');
const {
  calculateRentalPricing,
  calculateBuyPricing,
} = require('../../domain/services/PricingCalculator');

class CreateBooking {
  constructor({ listingRepository, bookingRepository }) {
    this.listingRepository = listingRepository;
    this.bookingRepository = bookingRepository;
  }

  async execute(input, actor = {}) {
    const renterId = actor.userId || input.renterId;
    if (!renterId) {
      const err = new Error('Authentication required');
      err.status = 401;
      throw err;
    }

    const listing = await this.listingRepository.findById(input.listingId);
    if (!listing) {
      const err = new Error('Listing not found');
      err.status = 404;
      throw err;
    }

    if (listing.ownerId && listing.ownerId === renterId) {
      const err = new Error('You cannot book your own listing');
      err.status = 400;
      throw err;
    }

    let pricing;
    let startDate;
    let endDate;

    if (listing.mode === 'buy') {
      pricing = calculateBuyPricing({ buyPrice: listing.buyPrice });
      const today = new Date();
      startDate = toIsoDate(today);
      endDate = toIsoDate(new Date(today.getTime() + 24 * 60 * 60 * 1000));
    } else {
      if (!input.startDate || !input.endDate) {
        const err = new Error('startDate and endDate are required for rentals');
        err.status = 400;
        throw err;
      }
      startDate = input.startDate;
      endDate = input.endDate;
      assertFutureRange(startDate);
      await assertAvailability({
        listing,
        startDate,
        endDate,
        bookingRepository: this.bookingRepository,
      });
      pricing = calculateRentalPricing({
        pricePerDay: listing.pricePerDay,
        startDate,
        endDate,
      });
    }

    const booking = new Booking({
      id: crypto.randomUUID(),
      listingId: listing.id,
      renterId,
      renterName: actor.name || input.renterName || 'Renter',
      ownerId: listing.ownerId,
      startDate,
      endDate,
      status: 'requested',
      pricing,
      message: input.message || '',
    });

    const saved = await this.bookingRepository.save(booking);
    return {
      booking: typeof saved.toJSON === 'function' ? saved.toJSON() : saved,
      listing: typeof listing.toJSON === 'function' ? listing.toJSON() : listing,
    };
  }
}

async function assertAvailability({ listing, startDate, endDate, bookingRepository }) {
  for (const day of enumerateDays(startDate, endDate)) {
    if (listing.isDateBlocked(day)) {
      const err = new Error(`Listing is unavailable on ${day}`);
      err.status = 409;
      throw err;
    }
  }
  const active = await bookingRepository.findActiveForListing(listing.id);
  for (const existing of active) {
    if (rangesOverlap(startDate, endDate, existing.startDate, existing.endDate)) {
      const err = new Error('Listing is already booked for overlapping dates');
      err.status = 409;
      throw err;
    }
  }
}

function assertFutureRange(startDate) {
  const start = parseIsoDate(startDate);
  const today = new Date();
  const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  if (start.getTime() < todayUtc) {
    const err = new Error('startDate cannot be in the past');
    err.status = 400;
    throw err;
  }
}

function enumerateDays(startDate, endDate) {
  const days = [];
  let cursor = parseIsoDate(startDate);
  const end = parseIsoDate(endDate);
  while (cursor < end) {
    days.push(toIsoDate(cursor));
    cursor = new Date(cursor.getTime() + 24 * 60 * 60 * 1000);
  }
  return days;
}

function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  return parseIsoDate(aStart) < parseIsoDate(bEnd) && parseIsoDate(bStart) < parseIsoDate(aEnd);
}

module.exports = { CreateBooking };
