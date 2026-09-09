'use strict';

const { Listing } = require('../../domain/entities/Listing');

const SEED = [
  new Listing({
    id: 'lst_tent_1',
    title: '4-Person Blackout Tent',
    category: 'camping',
    mode: 'rent',
    pricePerDay: 28,
    distanceMiles: 1.2,
    rating: 4.9,
    reviewCount: 86,
    ownerName: 'Mara T.',
    ownerId: 'owner_mara',
    isPro: true,
    location: 'Fremont, Seattle',
    zipCode: '98103',
    latitude: 47.651,
    longitude: -122.35,
    thumbnailTone: 'forest',
    description:
      'Roomy blackout tent that stays cool on sunny trailheads. Sleeps four with vestibule storage for packs and muddy boots.',
  }),
  new Listing({
    id: 'lst_pack_1',
    title: '60L Alpine Backpack',
    category: 'hiking',
    mode: 'rent',
    pricePerDay: 18,
    distanceMiles: 0.6,
    rating: 4.8,
    reviewCount: 42,
    ownerName: 'Devon K.',
    ownerId: 'owner_devon',
    isPro: false,
    location: 'Ballard, Seattle',
    zipCode: '98107',
    latitude: 47.6684,
    longitude: -122.376,
    thumbnailTone: 'brown',
    description:
      'Lightweight alpine pack with a ventilated harness and ice-axe loops. Ideal for overnight ridgeline trips.',
  }),
  new Listing({
    id: 'lst_sup_1',
    title: 'Inflatable Stand-Up Paddleboard',
    category: 'water',
    mode: 'rent',
    pricePerDay: 45,
    distanceMiles: 2.4,
    rating: 4.7,
    reviewCount: 31,
    ownerName: 'Jules R.',
    ownerId: 'owner_jules',
    isPro: true,
    location: 'Queen Anne, Seattle',
    zipCode: '98119',
    latitude: 47.638,
    longitude: -122.37,
    thumbnailTone: 'forest',
    description:
      'Stable all-around SUP with pump, leash, and backpack carry bag. Perfect for lakes and calm coastal water.',
  }),
  new Listing({
    id: 'lst_draws_1',
    title: 'Sport Climbing Quickdraw Set',
    category: 'climbing',
    mode: 'buy',
    buyPrice: 160,
    distanceMiles: 3.1,
    rating: 4.9,
    reviewCount: 19,
    ownerName: 'Casey M.',
    ownerId: 'owner_casey',
    isPro: false,
    location: 'Capitol Hill, Seattle',
    zipCode: '98102',
    latitude: 47.636,
    longitude: -122.322,
    thumbnailTone: 'brown',
    description:
      'Set of 12 lightly used quickdraws from a local gym climber. Hardware inspected and ready for sport routes.',
  }),
  new Listing({
    id: 'lst_split_1',
    title: 'Splitboard + Skins Package',
    category: 'snow',
    mode: 'rent',
    pricePerDay: 55,
    distanceMiles: 4.8,
    rating: 4.6,
    reviewCount: 27,
    ownerName: 'Noah P.',
    ownerId: 'owner_noah',
    isPro: true,
    location: 'Wedgwood, Seattle',
    zipCode: '98115',
    latitude: 47.685,
    longitude: -122.3,
    thumbnailTone: 'forest',
    description:
      'Backcountry splitboard with skins and poles. Tuned edges and a medium flex for mixed Cascade conditions.',
  }),
  new Listing({
    id: 'lst_bike_1',
    title: 'Full-Suspension Trail Bike',
    category: 'bikes',
    mode: 'buy',
    buyPrice: 980,
    distanceMiles: 1.8,
    rating: 4.5,
    reviewCount: 14,
    ownerName: 'Riley S.',
    ownerId: 'owner_riley',
    isPro: false,
    location: 'Magnolia, Seattle',
    zipCode: '98199',
    latitude: 47.647,
    longitude: -122.4,
    thumbnailTone: 'brown',
    description:
      'Well-maintained trail bike with fresh pads and a recent tune. Great for green and blue Pacific Northwest trails.',
  }),
  new Listing({
    id: 'lst_stove_1',
    title: 'Ultralight Camp Stove Kit',
    category: 'camping',
    mode: 'buy',
    buyPrice: 65,
    distanceMiles: 0.9,
    rating: 4.8,
    reviewCount: 53,
    ownerName: 'Ava L.',
    ownerId: 'owner_ava',
    isPro: false,
    location: 'Fremont, Seattle',
    zipCode: '98103',
    latitude: 47.655,
    longitude: -122.348,
    thumbnailTone: 'forest',
    description:
      'Compact canister stove with windscreen and titanium pot. Barely used — selling after switching kits.',
  }),
  new Listing({
    id: 'lst_poles_1',
    title: 'Two-Person Trekking Poles',
    category: 'hiking',
    mode: 'rent',
    pricePerDay: 12,
    distanceMiles: 1.5,
    rating: 4.4,
    reviewCount: 22,
    ownerName: 'Sam W.',
    ownerId: 'owner_sam',
    isPro: false,
    location: 'University District, Seattle',
    zipCode: '98105',
    latitude: 47.6615,
    longitude: -122.293,
    thumbnailTone: 'brown',
    description:
      'Pair of adjustable carbon poles with mud baskets. Comfortable foam grips for long approaches.',
  }),
  new Listing({
    id: 'lst_kayak_1',
    title: 'Sea Kayak Day Tour Setup',
    category: 'water',
    mode: 'rent',
    pricePerDay: 70,
    distanceMiles: 5.2,
    rating: 4.9,
    reviewCount: 38,
    ownerName: 'Harper B.',
    ownerId: 'owner_harper',
    isPro: true,
    location: 'Lake City, Seattle',
    zipCode: '98125',
    latitude: 47.717,
    longitude: -122.302,
    thumbnailTone: 'forest',
    description:
      'Stable touring kayak with paddle, PFD, and spray skirt. Ideal for sheltered Puget Sound day trips.',
  }),
  new Listing({
    id: 'lst_pad_1',
    title: 'Crash Pad for Bouldering',
    category: 'climbing',
    mode: 'rent',
    pricePerDay: 22,
    distanceMiles: 2.0,
    rating: 4.7,
    reviewCount: 16,
    ownerName: 'Quinn D.',
    ownerId: 'owner_quinn',
    isPro: false,
    location: 'Central District, Seattle',
    zipCode: '98122',
    latitude: 47.612,
    longitude: -122.308,
    thumbnailTone: 'brown',
    description:
      'Thick folding crash pad with shoulder straps. Clean cover and solid foam — ready for outdoor sessions.',
  }),
];

class InMemoryListingRepository {
  constructor(seed = SEED) {
    this.items = seed.map((item) => (item instanceof Listing ? item : new Listing(item)));
  }

  async findNear({
    category = 'all',
    mode = 'all',
    query = '',
    maxDistanceMiles = 25,
    zipCode = null,
  } = {}) {
    const { distanceFromZip } = require('../../domain/services/Geo');
    const q = String(query || '')
      .trim()
      .toLowerCase();

    return this.items
      .map((listing) => {
        const distanceMiles = zipCode ? distanceFromZip(listing, zipCode) : listing.distanceMiles;
        return Object.assign(Object.create(Object.getPrototypeOf(listing)), listing, {
          distanceMiles,
        });
      })
      .filter((listing) => {
        const catOk = category === 'all' || listing.category === category;
        const modeOk = mode === 'all' || listing.mode === mode;
        const distOk = listing.distanceMiles <= maxDistanceMiles;
        const queryOk =
          !q ||
          listing.title.toLowerCase().includes(q) ||
          listing.description.toLowerCase().includes(q) ||
          listing.location.toLowerCase().includes(q);
        return catOk && modeOk && distOk && queryOk;
      })
      .sort((a, b) => a.distanceMiles - b.distanceMiles);
  }

  async findById(id) {
    return this.items.find((l) => l.id === id) || null;
  }

  async findByOwnerId(ownerId) {
    return this.items.filter((l) => l.ownerId === ownerId);
  }

  async save(listing) {
    const idx = this.items.findIndex((l) => l.id === listing.id);
    if (idx >= 0) this.items[idx] = listing;
    else this.items.push(listing);
    return listing;
  }
}

module.exports = { InMemoryListingRepository, SEED };
