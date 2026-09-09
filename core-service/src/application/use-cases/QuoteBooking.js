'use strict';

const {
  calculateRentalPricing,
  calculateBuyPricing,
} = require('../../domain/services/PricingCalculator');

class QuoteBooking {
  constructor({ listingRepository }) {
    this.listingRepository = listingRepository;
  }

  async execute({ listingId, startDate, endDate }) {
    const listing = await this.listingRepository.findById(listingId);
    if (!listing) {
      const err = new Error('Listing not found');
      err.status = 404;
      throw err;
    }
    if (listing.mode === 'buy') {
      return {
        listingId: listing.id,
        mode: 'buy',
        pricing: calculateBuyPricing({ buyPrice: listing.buyPrice }),
      };
    }
    if (!startDate || !endDate) {
      const err = new Error('startDate and endDate are required for rental quotes');
      err.status = 400;
      throw err;
    }
    return {
      listingId: listing.id,
      mode: 'rent',
      startDate,
      endDate,
      pricing: calculateRentalPricing({
        pricePerDay: listing.pricePerDay,
        startDate,
        endDate,
      }),
    };
  }
}

module.exports = { QuoteBooking };
