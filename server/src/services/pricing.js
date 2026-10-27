'use strict';

const config = require('../config');

function daysBetween(startDate, endDate) {
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  const ms = end - start;
  const days = Math.round(ms / (24 * 60 * 60 * 1000));
  if (days < 1) {
    const err = new Error('endDate must be after startDate');
    err.status = 400;
    throw err;
  }
  return days;
}

function roundMoney(n) {
  return Math.round(Number(n) * 100) / 100;
}

function calculateRentalPricing({ pricePerDay, startDate, endDate }) {
  const days = daysBetween(startDate, endDate);
  const dailyRate = Number(pricePerDay);
  const subtotal = roundMoney(dailyRate * days);
  const serviceFee = roundMoney(subtotal * config.serviceFeeRate);
  const tax = roundMoney((subtotal + serviceFee) * config.taxRate);
  const total = roundMoney(subtotal + serviceFee + tax);
  return {
    currency: 'USD',
    days,
    dailyRate,
    subtotal,
    serviceFee,
    serviceFeeRate: config.serviceFeeRate,
    tax,
    taxRate: config.taxRate,
    total,
  };
}

function calculateBuyPricing({ buyPrice }) {
  const subtotal = roundMoney(buyPrice);
  const serviceFee = roundMoney(subtotal * config.serviceFeeRate);
  const tax = roundMoney((subtotal + serviceFee) * config.taxRate);
  const total = roundMoney(subtotal + serviceFee + tax);
  return {
    currency: 'USD',
    days: 1,
    dailyRate: null,
    subtotal,
    serviceFee,
    serviceFeeRate: config.serviceFeeRate,
    tax,
    taxRate: config.taxRate,
    total,
  };
}

module.exports = { calculateRentalPricing, calculateBuyPricing, daysBetween };
