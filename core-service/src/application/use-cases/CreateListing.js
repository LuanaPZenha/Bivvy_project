'use strict';

const crypto = require('crypto');
const { Listing } = require('../../domain/entities/Listing');
const { resolveZip } = require('../../domain/services/Geo');

class CreateListing {
  constructor({ listingRepository }) {
    this.listingRepository = listingRepository;
  }

  async execute(input, actor = {}) {
    const zip = input.zipCode || '98103';
    const geo = resolveZip(zip);
    const listing = new Listing({
      id: crypto.randomUUID(),
      title: input.title,
      category: input.category || 'camping',
      mode: input.mode || 'rent',
      pricePerDay: input.pricePerDay,
      buyPrice: input.buyPrice,
      distanceMiles: input.distanceMiles ?? 0,
      rating: input.rating ?? 0,
      reviewCount: input.reviewCount ?? 0,
      ownerName: input.ownerName || actor.name || 'You',
      ownerId: actor.userId || input.ownerId || null,
      isPro: Boolean(input.isPro),
      location: input.location || (geo && geo.label) || 'Seattle, WA',
      zipCode: zip,
      latitude: input.latitude ?? (geo && geo.lat) ?? 47.61,
      longitude: input.longitude ?? (geo && geo.lng) ?? -122.33,
      thumbnailTone: input.thumbnailTone || 'forest',
      description: input.description || '',
      blockedDates: input.blockedDates || [],
      // Images are added via POST /listings/:id/images — ignore client blobs on create.
      images: [],
    });
    const saved = await this.listingRepository.save(listing);
    return typeof saved.toJSON === 'function' ? saved.toJSON() : saved;
  }
}

module.exports = { CreateListing };
