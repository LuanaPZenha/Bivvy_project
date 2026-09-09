'use strict';

class ListOwnerListings {
  constructor({ listingRepository }) {
    this.listingRepository = listingRepository;
  }

  async execute({ ownerId }) {
    if (!ownerId) {
      const err = new Error('ownerId is required');
      err.status = 401;
      throw err;
    }
    const listings = await this.listingRepository.findByOwnerId(ownerId);
    return {
      count: listings.length,
      listings: listings.map((l) => (typeof l.toJSON === 'function' ? l.toJSON() : l)),
    };
  }
}

module.exports = { ListOwnerListings };
