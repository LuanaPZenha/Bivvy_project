'use strict';

const { Listing, ALLOWED_CATEGORIES, ALLOWED_MODES } = require('../../domain/entities/Listing');
const { resolveZip } = require('../../domain/services/Geo');

class UpdateListing {
  constructor({ listingRepository }) {
    this.listingRepository = listingRepository;
  }

  async execute(listingId, input = {}, actor = {}) {
    if (!actor.userId) {
      const err = new Error('Authentication required');
      err.status = 401;
      throw err;
    }

    const existing = await this.listingRepository.findById(listingId);
    if (!existing) {
      const err = new Error('Listing not found');
      err.status = 404;
      throw err;
    }
    if (existing.ownerId !== actor.userId) {
      const err = new Error('Forbidden');
      err.status = 403;
      throw err;
    }

    const mode = input.mode != null ? String(input.mode).toLowerCase() : existing.mode;
    if (!ALLOWED_MODES.has(mode)) {
      const err = new Error('Listing mode must be rent or buy');
      err.status = 400;
      throw err;
    }

    const category =
      input.category != null ? String(input.category).toLowerCase() : existing.category;
    if (!ALLOWED_CATEGORIES.has(category)) {
      const err = new Error(
        `Listing category must be one of: ${[...ALLOWED_CATEGORIES].join(', ')}`,
      );
      err.status = 400;
      throw err;
    }

    const zip = input.zipCode != null ? String(input.zipCode) : existing.zipCode;
    const geo = resolveZip(zip);

    const next = new Listing({
      id: existing.id,
      title: input.title != null ? input.title : existing.title,
      category,
      mode,
      pricePerDay:
        mode === 'rent'
          ? input.pricePerDay != null
            ? input.pricePerDay
            : existing.pricePerDay
          : null,
      buyPrice:
        mode === 'buy'
          ? input.buyPrice != null
            ? input.buyPrice
            : existing.buyPrice
          : input.buyPrice != null
            ? input.buyPrice
            : existing.buyPrice,
      distanceMiles: existing.distanceMiles,
      rating: existing.rating,
      reviewCount: existing.reviewCount,
      ownerName: existing.ownerName,
      ownerId: existing.ownerId,
      isPro: input.isPro != null ? Boolean(input.isPro) : existing.isPro,
      location:
        input.location != null
          ? input.location
          : input.zipCode != null && geo
            ? geo.label
            : existing.location,
      zipCode: zip,
      latitude: input.latitude != null ? input.latitude : existing.latitude,
      longitude: input.longitude != null ? input.longitude : existing.longitude,
      thumbnailTone: input.thumbnailTone != null ? input.thumbnailTone : existing.thumbnailTone,
      description: input.description != null ? input.description : existing.description,
      blockedDates: Array.isArray(input.blockedDates)
        ? input.blockedDates.map(String)
        : existing.blockedDates,
      images: existing.images,
    });

    const saved = await this.listingRepository.save(next);
    return typeof saved.toJSON === 'function' ? saved.toJSON() : saved;
  }
}

module.exports = { UpdateListing };
