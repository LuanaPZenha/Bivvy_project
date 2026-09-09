'use strict';

const { CreateBooking } = require('./CreateBooking');

/**
 * Create a buy booking request for each listing id (cart checkout).
 * Does not simulate payment — owners still accept, then renter uses SimulateCheckout.
 */
class CheckoutCart {
  constructor({ listingRepository, bookingRepository }) {
    this.createBooking = new CreateBooking({ listingRepository, bookingRepository });
    this.listingRepository = listingRepository;
  }

  async execute(input, actor = {}) {
    const listingIds = Array.isArray(input.listingIds)
      ? [...new Set(input.listingIds.map(String))]
      : [];
    if (listingIds.length === 0) {
      const err = new Error('listingIds is required');
      err.status = 400;
      throw err;
    }
    if (listingIds.length > 20) {
      const err = new Error('Cart checkout supports at most 20 items');
      err.status = 400;
      throw err;
    }

    const bookings = [];
    for (const listingId of listingIds) {
      const listing = await this.listingRepository.findById(listingId);
      if (!listing) {
        const err = new Error(`Listing not found: ${listingId}`);
        err.status = 404;
        throw err;
      }
      if (listing.mode !== 'buy') {
        const err = new Error(`Only buy listings can be checked out from the cart (${listingId})`);
        err.status = 400;
        throw err;
      }
      const result = await this.createBooking.execute(
        {
          listingId,
          message: input.message || '',
        },
        actor,
      );
      bookings.push(result);
    }

    return { count: bookings.length, bookings };
  }
}

module.exports = { CheckoutCart };
