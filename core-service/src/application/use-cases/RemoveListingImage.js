'use strict';

const { Listing } = require('../../domain/entities/Listing');

class RemoveListingImage {
  constructor({ listingRepository, imageStore }) {
    this.listingRepository = listingRepository;
    this.imageStore = imageStore;
  }

  async execute({ listingId, imageId }, actor = {}) {
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

    const images = Array.isArray(existing.images) ? [...existing.images] : [];
    const idx = images.findIndex((img) => img && String(img.id) === String(imageId));
    if (idx < 0) {
      const err = new Error('Image not found');
      err.status = 404;
      throw err;
    }

    const [removed] = images.splice(idx, 1);
    if (removed && removed.filename) {
      await this.imageStore.deleteFile(removed.filename);
    }

    const next = new Listing({
      ...existing.toJSON(),
      images,
    });
    const saved = await this.listingRepository.save(next);
    const json = typeof saved.toJSON === 'function' ? saved.toJSON() : saved;
    return {
      listingId,
      removedImageId: String(imageId),
      images: json.images || [],
    };
  }
}

module.exports = { RemoveListingImage };
