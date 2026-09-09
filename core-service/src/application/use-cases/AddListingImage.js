'use strict';

class AddListingImage {
  constructor({ listingRepository, imageStore }) {
    this.listingRepository = listingRepository;
    this.imageStore = imageStore;
  }

  async execute({ listingId, buffer, contentType, size }, actor = {}) {
    if (!actor.userId) {
      const err = new Error('Authentication required');
      err.status = 401;
      throw err;
    }

    const listing = await this.listingRepository.findById(listingId);
    if (!listing) {
      const err = new Error('Listing not found');
      err.status = 404;
      throw err;
    }

    if (!listing.ownerId || listing.ownerId !== actor.userId) {
      const err = new Error('Only the listing owner can upload images');
      err.status = 403;
      throw err;
    }

    const images = Array.isArray(listing.images) ? [...listing.images] : [];
    const max = this.imageStore.maxImagesPerListing || 5;
    if (images.length >= max) {
      const err = new Error(`Listings can have at most ${max} images`);
      err.status = 409;
      throw err;
    }

    const meta = await this.imageStore.saveBuffer({
      buffer,
      contentType: contentType || 'application/octet-stream',
    });
    if (size != null && Number(size) !== meta.size) {
      // Prefer measured size from disk write.
    }

    images.push(meta);
    listing.images = images;
    await this.listingRepository.save(listing);

    return {
      listingId: listing.id,
      image: meta,
      images,
    };
  }
}

module.exports = { AddListingImage };
