'use strict';

const crypto = require('crypto');
const { SEED_LISTINGS } = require('../data/seed');

function createStore() {
  return {
    users: new Map(),
    listings: new Map(SEED_LISTINGS.map((l) => [l.id, structuredClone(l)])),
    bookings: new Map(),
    messages: new Map(),
    reviews: new Map(),
  };
}

function newId(prefix = 'id') {
  return `${prefix}_${crypto.randomUUID()}`;
}

module.exports = { createStore, newId };
