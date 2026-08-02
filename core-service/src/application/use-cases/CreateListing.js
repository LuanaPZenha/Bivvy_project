'use strict';

const { Listing } = require('../../domain/entities/Listing');
const crypto = require('crypto');

class CreateListing {
  constructor({ listingRepository }) {
    this.listingRepository = listingRepository;
  }

  async execute(input) {
    const listing = new Listing({
      id: crypto.randomUUID(),
      title: input.title,
      category: input.category || 'camping',
      pricePerDay: input.pricePerDay,
      distanceMiles: input.distanceMiles ?? 0,
      rating: input.rating ?? 0,
      reviewCount: input.reviewCount ?? 0,
      ownerName: input.ownerName || 'You',
      isPro: Boolean(input.isPro),
      location: input.location || 'Seattle, WA',
    });
    return this.listingRepository.save(listing);
  }
}

module.exports = { CreateListing };
