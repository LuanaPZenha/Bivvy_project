'use strict';

const { parseIsoDate } = require('../entities/Booking');

const SERVICE_FEE_RATE = 0.1;
const TAX_RATE = 0.0805;

function calculateRentalPricing({ pricePerDay, startDate, endDate }) {
  if (pricePerDay == null || Number(pricePerDay) < 0) {
    const err = new Error('Valid pricePerDay is required for rental pricing');
    err.status = 400;
    throw err;
  }

  const start = parseIsoDate(startDate);
  const end = parseIsoDate(endDate);
  const days = Math.round((end - start) / (24 * 60 * 60 * 1000));
  if (days < 1) {
    const err = new Error('Rental must be at least 1 day');
    err.status = 400;
    throw err;
  }

  const dailyRate = Number(pricePerDay);
  const subtotal = roundMoney(dailyRate * days);
  const serviceFee = roundMoney(subtotal * SERVICE_FEE_RATE);
  const tax = roundMoney(roundMoney(subtotal + serviceFee) * TAX_RATE);
  const total = roundMoney(subtotal + serviceFee + tax);

  return {
    currency: 'USD',
    days,
    dailyRate,
    subtotal,
    serviceFee,
    serviceFeeRate: SERVICE_FEE_RATE,
    tax,
    taxRate: TAX_RATE,
    total,
  };
}

function calculateBuyPricing({ buyPrice }) {
  if (buyPrice == null || Number(buyPrice) < 0) {
    const err = new Error('Valid buyPrice is required');
    err.status = 400;
    throw err;
  }
  const subtotal = roundMoney(Number(buyPrice));
  const serviceFee = roundMoney(subtotal * SERVICE_FEE_RATE);
  const tax = roundMoney(roundMoney(subtotal + serviceFee) * TAX_RATE);
  const total = roundMoney(subtotal + serviceFee + tax);
  return {
    currency: 'USD',
    days: 0,
    dailyRate: null,
    subtotal,
    serviceFee,
    serviceFeeRate: SERVICE_FEE_RATE,
    tax,
    taxRate: TAX_RATE,
    total,
  };
}

function roundMoney(value) {
  return Math.round(Number(value) * 100) / 100;
}

module.exports = {
  calculateRentalPricing,
  calculateBuyPricing,
  SERVICE_FEE_RATE,
  TAX_RATE,
};
