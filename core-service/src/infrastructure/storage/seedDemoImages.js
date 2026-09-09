'use strict';

const zlib = require('zlib');

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i += 1) {
    c ^= buf[i];
    for (let k = 0; k < 8; k += 1) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeB = Buffer.from(type);
  const crcB = Buffer.alloc(4);
  crcB.writeUInt32BE(crc32(Buffer.concat([typeB, data])));
  return Buffer.concat([len, typeB, data, crcB]);
}

function makePng(w, h, paint) {
  const raw = Buffer.alloc((w * 3 + 1) * h);
  for (let y = 0; y < h; y += 1) {
    raw[y * (w * 3 + 1)] = 0;
    for (let x = 0; x < w; x += 1) {
      const [r, g, b] = paint(x, y, w, h);
      const i = y * (w * 3 + 1) + 1 + x * 3;
      raw[i] = r;
      raw[i + 1] = g;
      raw[i + 2] = b;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const DEMO_PNG_FOREST = makePng(160, 120, (x, y, w, h) => {
  const base = [20 + Math.floor((40 * y) / h), 60 + Math.floor((50 * x) / w), 40];
  if ((x + y) % 24 < 4) return [212, 175, 55];
  if (y > h * 0.65 && x > w * 0.2 && x < w * 0.8) return [245, 240, 230];
  return base;
});

const DEMO_PNG_BROWN = makePng(160, 120, (x, y, w, h) => {
  const base = [90 + Math.floor((30 * x) / w), 60, 40];
  if ((x * 2 + y) % 30 < 5) return [20, 80, 50];
  if (x > 40 && x < 120 && y > 30 && y < 90) return [230, 220, 200];
  return base;
});

/** @deprecated tiny fallback — prefer DEMO_PNG_FOREST */
const DEMO_PNG = DEMO_PNG_FOREST;

const DEMO_LISTING_IDS = ['lst_tent_1', 'lst_stove_1', 'lst_draws_1', 'lst_split_1'];

async function seedDemoListingImages({ listingRepository, imageStore }) {
  for (const listingId of DEMO_LISTING_IDS) {
    const listing = await listingRepository.findById(listingId);
    if (!listing) continue;
    if (Array.isArray(listing.images) && listing.images.length > 0) continue;
    const buffer = listing.thumbnailTone === 'brown' ? DEMO_PNG_BROWN : DEMO_PNG_FOREST;
    const meta = await imageStore.saveBuffer({
      buffer,
      contentType: 'image/png',
    });
    listing.images = [meta];
    await listingRepository.save(listing);
  }
}

module.exports = {
  seedDemoListingImages,
  DEMO_PNG,
  DEMO_PNG_FOREST,
  DEMO_PNG_BROWN,
  DEMO_LISTING_IDS,
};
