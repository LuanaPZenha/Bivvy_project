'use strict';

class ListBookings {
  constructor({ bookingRepository, listingRepository }) {
    this.bookingRepository = bookingRepository;
    this.listingRepository = listingRepository;
  }

  async execute({ userId }) {
    if (!userId) {
      const err = new Error('Authentication required');
      err.status = 401;
      throw err;
    }
    const bookings = await this.bookingRepository.findForUser(userId);
    const enriched = [];
    for (const booking of bookings) {
      const json = typeof booking.toJSON === 'function' ? booking.toJSON() : { ...booking };
      let listingSummary = null;
      if (this.listingRepository) {
        const listing = await this.listingRepository.findById(json.listingId);
        if (listing) {
          const row = typeof listing.toJSON === 'function' ? listing.toJSON() : listing;
          listingSummary = {
            id: row.id,
            title: row.title,
            mode: row.mode,
            category: row.category,
            thumbnailTone: row.thumbnailTone,
            images: Array.isArray(row.images) ? row.images.slice(0, 1) : [],
            ownerName: row.ownerName,
          };
        }
      }
      enriched.push({ ...json, listing: listingSummary });
    }
    return {
      count: enriched.length,
      bookings: enriched,
    };
  }
}

module.exports = { ListBookings };
