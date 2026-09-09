'use strict';

class GetListingById {
  constructor({ listingRepository }) {
    this.listingRepository = listingRepository;
  }

  async execute({ id }) {
    if (!id) {
      const err = new Error('Listing id is required');
      err.status = 400;
      throw err;
    }
    const listing = await this.listingRepository.findById(id);
    if (!listing) {
      const err = new Error('Listing not found');
      err.status = 404;
      throw err;
    }
    return typeof listing.toJSON === 'function' ? listing.toJSON() : listing;
  }
}

module.exports = { GetListingById };
