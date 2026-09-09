'use strict';

const { Booking } = require('../../domain/entities/Booking');

class InMemoryBookingRepository {
  constructor(seed = []) {
    this.items = seed.map((item) => (item instanceof Booking ? item : new Booking(item)));
  }

  async findById(id) {
    return this.items.find((b) => b.id === id) || null;
  }

  async findForUser(userId) {
    return this.items
      .filter((b) => b.renterId === userId || b.ownerId === userId)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  async findActiveForListing(listingId) {
    return this.items.filter(
      (b) => b.listingId === listingId && (b.status === 'requested' || b.status === 'accepted'),
    );
  }

  async save(booking) {
    const idx = this.items.findIndex((b) => b.id === booking.id);
    if (idx >= 0) this.items[idx] = booking;
    else this.items.push(booking);
    return booking;
  }
}

module.exports = { InMemoryBookingRepository };
