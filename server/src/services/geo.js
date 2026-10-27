'use strict';

const { SEATTLE_ZIPS } = require('../data/seed');

function haversineMiles(a, b) {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 3958.8;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function resolveZip(zipCode) {
  return SEATTLE_ZIPS[String(zipCode)] || null;
}

function distanceFromZip(listing, zipCode) {
  const zip = resolveZip(zipCode);
  if (!zip) return listing.distanceMiles;
  return (
    Math.round(
      haversineMiles(
        { lat: listing.latitude, lng: listing.longitude },
        { lat: zip.lat, lng: zip.lng },
      ) * 10,
    ) / 10
  );
}

module.exports = { resolveZip, distanceFromZip, SEATTLE_ZIPS };
