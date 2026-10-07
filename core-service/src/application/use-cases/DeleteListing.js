'use strict';

class DeleteListing {
  constructor({ listingRepository, imageStore }) {
    this.listingRepository = listingRepository;
    this.imageStore = imageStore;
  }

  async execute(listingId, actor = {}) {
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

    if (this.imageStore && Array.isArray(existing.images)) {
      for (const image of existing.images) {
        if (image && image.filename) {
          await this.imageStore.deleteFile(image.filename);
        }
      }
    }

    await this.listingRepository.deleteById(listingId);
    return { deleted: true, id: listingId };
  }
}

module.exports = { DeleteListing };
