'use strict';

const ZIP_DIRECTORY = {
  '98101': { lat: 47.6101, lng: -122.3344, label: 'Downtown Seattle, WA' },
  '98102': { lat: 47.636, lng: -122.322, label: 'Capitol Hill, Seattle' },
  '98103': { lat: 47.6733, lng: -122.3426, label: 'Fremont, Seattle' },
  '98105': { lat: 47.6615, lng: -122.293, label: 'University District, Seattle' },
  '98107': { lat: 47.6684, lng: -122.376, label: 'Ballard, Seattle' },
  '98109': { lat: 47.6307, lng: -122.3473, label: 'South Lake Union, Seattle' },
  '98115': { lat: 47.685, lng: -122.3, label: 'Wedgwood, Seattle' },
  '98119': { lat: 47.638, lng: -122.37, label: 'Queen Anne, Seattle' },
  '98122': { lat: 47.612, lng: -122.308, label: 'Central District, Seattle' },
  '98125': { lat: 47.717, lng: -122.302, label: 'Lake City, Seattle' },
  '98199': { lat: 47.647, lng: -122.4, label: 'Magnolia, Seattle' },
};

function resolveZip(zipCode) {
  if (!zipCode) return null;
  return ZIP_DIRECTORY[String(zipCode).trim()] || null;
}

function haversineMiles(a, b) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 3958.8;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function distanceFromZip(listing, zipCode) {
  const origin = resolveZip(zipCode);
  if (!origin) return listing.distanceMiles;
  return (
    Math.round(
      haversineMiles(
        { lat: origin.lat, lng: origin.lng },
        { lat: listing.latitude, lng: listing.longitude },
      ) * 10,
    ) / 10
  );
}

module.exports = { ZIP_DIRECTORY, resolveZip, haversineMiles, distanceFromZip };
