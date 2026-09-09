'use strict';

class GetListingImage {
  constructor({ listingRepository, imageStore }) {
    this.listingRepository = listingRepository;
    this.imageStore = imageStore;
  }

  async list({ listingId }) {
    const listing = await this.listingRepository.findById(listingId);
    if (!listing) {
      const err = new Error('Listing not found');
      err.status = 404;
      throw err;
    }
    const images = Array.isArray(listing.images) ? listing.images : [];
    return {
      listingId: listing.id,
      count: images.length,
      images: images.map((img) => ({
        id: img.id,
        contentType: img.contentType,
        size: img.size,
        createdAt: img.createdAt,
        url: `/api/gear/${listing.id}/images/${img.id}`,
      })),
    };
  }

  async getBinary({ listingId, imageId }) {
    const listing = await this.listingRepository.findById(listingId);
    if (!listing) {
      const err = new Error('Listing not found');
      err.status = 404;
      throw err;
    }
    const images = Array.isArray(listing.images) ? listing.images : [];
    const meta = images.find((img) => img.id === imageId);
    if (!meta) {
      const err = new Error('Image not found');
      err.status = 404;
      throw err;
    }
    const buffer = await this.imageStore.readFile(meta.filename);
    return { buffer, contentType: meta.contentType, meta };
  }
}

module.exports = { GetListingImage };
