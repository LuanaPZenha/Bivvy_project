'use strict';

const { Listing } = require('../../domain/entities/Listing');

const SEED = [
  new Listing({
    id: 'lst_tent_1',
    title: '4-Person Blackout Tent',
    category: 'camping',
    pricePerDay: 28,
    distanceMiles: 1.2,
    rating: 4.9,
    reviewCount: 86,
    ownerName: 'Mara T.',
    isPro: true,
  }),
  new Listing({
    id: 'lst_pack_1',
    title: '60L Alpine Backpack',
    category: 'backpacks',
    pricePerDay: 18,
    distanceMiles: 0.6,
    rating: 4.8,
    reviewCount: 42,
    ownerName: 'Devon K.',
    isPro: false,
  }),
];

class InMemoryListingRepository {
  constructor(seed = SEED) {
    this.items = [...seed];
  }

  async findNear({ category = 'all', maxDistanceMiles = 25 } = {}) {
    return this.items.filter((l) => {
      const catOk = category === 'all' || l.category === category;
      const distOk = l.distanceMiles <= maxDistanceMiles;
      return catOk && distOk;
    });
  }

  async findById(id) {
    return this.items.find((l) => l.id === id) || null;
  }

  async save(listing) {
    this.items.push(listing);
    return listing;
  }
}

module.exports = { InMemoryListingRepository };
