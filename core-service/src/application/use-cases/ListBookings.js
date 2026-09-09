'use strict';

class ListBookings {
  constructor({ bookingRepository }) {
    this.bookingRepository = bookingRepository;
  }

  async execute({ userId }) {
    if (!userId) {
      const err = new Error('Authentication required');
      err.status = 401;
      throw err;
    }
    const bookings = await this.bookingRepository.findForUser(userId);
    return {
      count: bookings.length,
      bookings: bookings.map((b) => (typeof b.toJSON === 'function' ? b.toJSON() : b)),
    };
  }
}

module.exports = { ListBookings };
