'use strict';

class IBookingRepository {
  async findById(_id) {
    throw new Error('Not implemented');
  }

  async findForUser(_userId) {
    throw new Error('Not implemented');
  }

  async findActiveForListing(_listingId) {
    throw new Error('Not implemented');
  }

  async save(_booking) {
    throw new Error('Not implemented');
  }
}

module.exports = { IBookingRepository };
