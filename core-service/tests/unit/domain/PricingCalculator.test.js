'use strict';

const {
  calculateRentalPricing,
  calculateBuyPricing,
} = require('../../../src/domain/services/PricingCalculator');

describe('PricingCalculator', () => {
  it('computes a rental breakdown', () => {
    const pricing = calculateRentalPricing({
      pricePerDay: 28,
      startDate: '2026-09-10',
      endDate: '2026-09-13',
    });
    expect(pricing.days).toBe(3);
    expect(pricing.subtotal).toBe(84);
    expect(pricing.serviceFee).toBe(8.4);
    expect(pricing.total).toBe(99.84);
  });

  it('computes buy pricing', () => {
    const pricing = calculateBuyPricing({ buyPrice: 100 });
    expect(pricing.total).toBe(118.86);
  });
});
