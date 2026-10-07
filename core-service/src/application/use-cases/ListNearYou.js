'use strict';

const ALLOWED_SORT = new Set(['distance', 'price_asc', 'price_desc', 'rating']);

function listingPrice(listing) {
  if (listing.mode === 'buy') return Number(listing.buyPrice) || 0;
  return Number(listing.pricePerDay) || 0;
}

function sortListings(listings, sortBy) {
  const sorted = [...listings];
  switch (sortBy) {
    case 'price_asc':
      return sorted.sort((a, b) => listingPrice(a) - listingPrice(b));
    case 'price_desc':
      return sorted.sort((a, b) => listingPrice(b) - listingPrice(a));
    case 'rating':
      return sorted.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
    case 'distance':
    default:
      return sorted.sort((a, b) => (Number(a.distanceMiles) || 0) - (Number(b.distanceMiles) || 0));
  }
}

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
    sortBy = 'distance',
  } = {}) {
    const sort = ALLOWED_SORT.has(String(sortBy || '').toLowerCase())
      ? String(sortBy).toLowerCase()
      : 'distance';

    const listings = await this.listingRepository.findNear({
      category,
      mode,
      query,
      maxDistanceMiles: Number(maxDistanceMiles) || 25,
      zipCode: zipCode || null,
    });

    const ordered = sortListings(listings, sort);
    return {
      count: ordered.length,
      zipCode: zipCode || null,
      sortBy: sort,
      listings: ordered.map((l) => (typeof l.toJSON === 'function' ? l.toJSON() : l)),
    };
  }
}

module.exports = { ListNearYou, ALLOWED_SORT };
