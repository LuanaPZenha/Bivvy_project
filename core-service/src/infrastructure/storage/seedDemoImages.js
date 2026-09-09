'use strict';

/** Tiny solid PNG (1×1) used as bootstrap listing photos. */
const DEMO_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mNk+M9Qz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC',
  'base64',
);

const DEMO_LISTING_IDS = ['lst_tent_1', 'lst_stove_1', 'lst_draws_1', 'lst_split_1'];

async function seedDemoListingImages({ listingRepository, imageStore }) {
  for (const listingId of DEMO_LISTING_IDS) {
    const listing = await listingRepository.findById(listingId);
    if (!listing) continue;
    if (Array.isArray(listing.images) && listing.images.length > 0) continue;
    const meta = await imageStore.saveBuffer({
      buffer: DEMO_PNG,
      contentType: 'image/png',
    });
    listing.images = [meta];
    await listingRepository.save(listing);
  }
}

module.exports = { seedDemoListingImages, DEMO_PNG, DEMO_LISTING_IDS };
