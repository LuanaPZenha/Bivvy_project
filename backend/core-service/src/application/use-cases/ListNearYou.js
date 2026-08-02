'use strict';

class ListNearYou {
  constructor({ listingRepository }) {
    this.listingRepository = listingRepository;
  }

  async execute({ category = 'all', maxDistanceMiles = 25 } = {}) {
    const listings = await this.listingRepository.findNear({
      category,
      maxDistanceMiles,
    });
    return {
      count: listings.length,
      listings,
    };
  }
}

module.exports = { ListNearYou };
