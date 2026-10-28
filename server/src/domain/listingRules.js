'use strict';

const { httpError } = require('../http/errors');
const { plain, money, isoDate } = require('../security/text');

const CATEGORIES = new Set(['camping', 'hiking', 'climbing', 'water', 'snow', 'bikes']);
const MODES = new Set(['rent', 'buy']);
const SORTS = new Set(['distance', 'price_asc', 'price_desc', 'rating']);

function readListingInput(body = {}, { partial = false } = {}) {
  const source = body && typeof body === 'object' ? body : {};
  const out = {};

  if (!partial || source.title != null) {
    out.title = plain(source.title, 120);
    if (!out.title) throw httpError(400, 'Listing requires a title');
  }
  if (!partial || source.category != null) {
    out.category = String(source.category || 'camping').toLowerCase();
    if (!CATEGORIES.has(out.category)) throw httpError(400, 'Invalid category');
  }
  if (!partial || source.mode != null) {
    out.mode = String(source.mode || 'rent').toLowerCase();
    if (!MODES.has(out.mode)) throw httpError(400, 'Mode must be rent or buy');
  }
  if (!partial || source.description != null) {
    out.description = plain(source.description, 4000);
  }
  if (!partial || source.zipCode != null) {
    out.zipCode = plain(source.zipCode || '98103', 12);
    if (!/^\d{5}$/.test(out.zipCode)) throw httpError(400, 'ZIP code must be 5 digits');
  }
  if (!partial || source.blockedDates != null) {
    if (source.blockedDates != null && !Array.isArray(source.blockedDates)) {
      throw httpError(400, 'blockedDates must be a list of dates');
    }
    const dates = Array.isArray(source.blockedDates) ? source.blockedDates : [];
    if (dates.length > 366) throw httpError(400, 'Too many blocked dates');
    out.blockedDates = dates.map((date) => isoDate(date, 'blockedDates'));
  }
  if (!partial || source.pricePerDay != null) {
    out.pricePerDay = source.pricePerDay == null || source.pricePerDay === '' ? null : money(source.pricePerDay, 'pricePerDay');
  }
  if (!partial || source.buyPrice != null) {
    out.buyPrice = source.buyPrice == null || source.buyPrice === '' ? null : money(source.buyPrice, 'buyPrice');
  }
  if (source.isPro != null) out.isPro = source.isPro === true;
  return out;
}

function readDiscoveryQuery(query = {}) {
  const category = String(query.category || 'all').toLowerCase();
  const mode = String(query.mode || 'all').toLowerCase();
  if (category !== 'all' && !CATEGORIES.has(category)) throw httpError(400, 'Invalid category');
  if (mode !== 'all' && !MODES.has(mode)) throw httpError(400, 'Invalid mode');
  const q = plain(query.q || query.query || '', 80).toLowerCase();
  let maxDistance = Number(query.maxDistance || 25);
  if (!Number.isFinite(maxDistance) || maxDistance <= 0) maxDistance = 25;
  if (maxDistance > 100) maxDistance = 100;
  const sortBy = String(query.sort || query.sortBy || 'distance').toLowerCase();
  return {
    category,
    mode,
    q,
    maxDistance,
    zipCode: query.zip || query.zipCode || null,
    sortBy: SORTS.has(sortBy) ? sortBy : 'distance',
  };
}

module.exports = { CATEGORIES, MODES, readListingInput, readDiscoveryQuery };
