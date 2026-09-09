'use strict';

class ListNearYou {
  constructor({ listingRepository }) {
    this.listingRepository = listingRepository;
  }

  async execute({
    category = 'all',
    mode = 'all',
    query = '',
    maxDistanceMiles = 25,
    zipCode = null,
  } = {}) {
    const listings = await this.listingRepository.findNear({
      category,
      mode,
      query,
      maxDistanceMiles: Number(maxDistanceMiles) || 25,
      zipCode: zipCode || null,
    });
    return {
      count: listings.length,
      zipCode: zipCode || null,
      listings: listings.map((l) => (typeof l.toJSON === 'function' ? l.toJSON() : l)),
    };
  }
}

module.exports = { ListNearYou };
