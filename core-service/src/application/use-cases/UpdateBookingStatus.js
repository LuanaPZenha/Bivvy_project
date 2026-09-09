'use strict';

class UpdateBookingStatus {
  constructor({ bookingRepository }) {
    this.bookingRepository = bookingRepository;
  }

  async execute({ bookingId, status, userId }) {
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
    const isOwner = booking.ownerId === userId;
    const isRenter = booking.renterId === userId;
    if (!isOwner && !isRenter) {
      const err = new Error('Forbidden');
      err.status = 403;
      throw err;
    }
    if (['accepted', 'declined', 'completed'].includes(status) && !isOwner) {
      const err = new Error('Only the owner can update booking to this status');
      err.status = 403;
      throw err;
    }
    booking.transitionTo(status);
    const saved = await this.bookingRepository.save(booking);
    return typeof saved.toJSON === 'function' ? saved.toJSON() : saved;
  }
}

module.exports = { UpdateBookingStatus };
