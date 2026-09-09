'use strict';

const ALLOWED_CATEGORIES = new Set([
  'camping',
  'hiking',
  'climbing',
  'water',
  'snow',
  'bikes',
]);
const ALLOWED_MODES = new Set(['rent', 'buy']);
const ALLOWED_TONES = new Set(['forest', 'brown']);

class Listing {
  constructor({
    id,
    title,
    category = 'camping',
    mode = 'rent',
    pricePerDay = null,
    buyPrice = null,
    distanceMiles = 0,
    rating = 0,
    reviewCount = 0,
    ownerName,
    ownerId = null,
    isPro = false,
    location = 'Seattle, WA',
    zipCode = '98103',
    latitude = 47.651,
    longitude = -122.35,
    thumbnailTone = 'forest',
    description = '',
    blockedDates = [],
  }) {
    if (!title || !String(title).trim()) {
      throw clientError('Listing requires a title');
    }

    const normalizedMode = String(mode || 'rent').toLowerCase();
    if (!ALLOWED_MODES.has(normalizedMode)) {
      throw clientError('Listing mode must be rent or buy');
    }

    const normalizedCategory = String(category || 'camping').toLowerCase();
    if (!ALLOWED_CATEGORIES.has(normalizedCategory)) {
      throw clientError(
        `Listing category must be one of: ${[...ALLOWED_CATEGORIES].join(', ')}`,
      );
    }

    if (normalizedMode === 'rent') {
      if (pricePerDay == null || Number.isNaN(Number(pricePerDay))) {
        throw clientError('Rent listings require pricePerDay');
      }
      if (Number(pricePerDay) < 0) throw clientError('pricePerDay cannot be negative');
    }

    if (normalizedMode === 'buy') {
      if (buyPrice == null || Number.isNaN(Number(buyPrice))) {
        throw clientError('Buy listings require buyPrice');
      }
      if (Number(buyPrice) < 0) throw clientError('buyPrice cannot be negative');
    }

    this.id = id;
    this.title = String(title).trim();
    this.category = normalizedCategory;
    this.mode = normalizedMode;
    this.pricePerDay = normalizedMode === 'rent' ? Number(pricePerDay) : null;
    this.buyPrice =
      normalizedMode === 'buy' ? Number(buyPrice) : buyPrice == null ? null : Number(buyPrice);
    this.distanceMiles = Number(distanceMiles) || 0;
    this.rating = Number(rating) || 0;
    this.reviewCount = Number(reviewCount) || 0;
    this.ownerName = ownerName || 'You';
    this.ownerId = ownerId || null;
    this.isPro = Boolean(isPro);
    this.location = location || 'Seattle, WA';
    this.zipCode = String(zipCode || '98103');
    this.latitude = Number(latitude);
    this.longitude = Number(longitude);
    this.thumbnailTone = ALLOWED_TONES.has(thumbnailTone) ? thumbnailTone : 'forest';
    this.description = description || '';
    this.blockedDates = Array.isArray(blockedDates) ? [...blockedDates] : [];
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      category: this.category,
      mode: this.mode,
      pricePerDay: this.pricePerDay,
      buyPrice: this.buyPrice,
      distanceMiles: this.distanceMiles,
      rating: this.rating,
      reviewCount: this.reviewCount,
      ownerName: this.ownerName,
      ownerId: this.ownerId,
      isPro: this.isPro,
      location: this.location,
      zipCode: this.zipCode,
      latitude: this.latitude,
      longitude: this.longitude,
      thumbnailTone: this.thumbnailTone,
      description: this.description,
      blockedDates: this.blockedDates,
    };
  }

  isDateBlocked(isoDate) {
    return this.blockedDates.includes(isoDate);
  }
}

function clientError(message) {
  const err = new Error(message);
  err.status = 400;
  return err;
}

module.exports = { Listing, ALLOWED_CATEGORIES, ALLOWED_MODES };
