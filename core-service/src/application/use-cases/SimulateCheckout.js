'use strict';

const crypto = require('crypto');

class SimulateCheckout {
  constructor({ bookingRepository }) {
    this.bookingRepository = bookingRepository;
  }

  async execute({ bookingId, userId }) {
    if (!userId) {
      const err = new Error('Authentication required');
      err.status = 401;
      throw err;
    }
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      const err = new Error('Booking not found');
      err.status = 404;
      throw err;
    }
    if (booking.renterId !== userId) {
      const err = new Error('Only the renter can check out');
      err.status = 403;
      throw err;
    }
    if (booking.status !== 'accepted') {
      const err = new Error('Checkout requires an accepted booking');
      err.status = 400;
      throw err;
    }
    booking.payment = {
      provider: 'bivvy_sim',
      status: 'succeeded',
      currency: booking.pricing.currency || 'USD',
      amount: booking.pricing.total,
      transactionId: `sim_${crypto.randomBytes(8).toString('hex')}`,
      paidAt: new Date().toISOString(),
    };
    booking.transitionTo('completed');
    const saved = await this.bookingRepository.save(booking);
    return typeof saved.toJSON === 'function' ? saved.toJSON() : saved;
  }
}

module.exports = { SimulateCheckout };
