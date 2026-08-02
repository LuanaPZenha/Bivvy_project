'use strict';

class Listing {
  constructor({
    id,
    title,
    category,
    pricePerDay,
    distanceMiles,
    rating,
    reviewCount,
    ownerName,
    isPro = false,
    location = 'Seattle, WA',
  }) {
    if (!title || pricePerDay == null) {
      throw new Error('Listing requires title and pricePerDay');
    }
    this.id = id;
    this.title = title;
    this.category = category;
    this.pricePerDay = Number(pricePerDay);
    this.distanceMiles = Number(distanceMiles);
    this.rating = Number(rating);
    this.reviewCount = Number(reviewCount);
    this.ownerName = ownerName;
    this.isPro = Boolean(isPro);
    this.location = location;
  }
}

module.exports = { Listing };
