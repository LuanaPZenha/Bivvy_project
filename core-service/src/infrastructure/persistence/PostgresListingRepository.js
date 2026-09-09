'use strict';

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const { Listing } = require('../../domain/entities/Listing');
const { SEED } = require('./InMemoryListingRepository');

const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

class PostgresListingRepository {
  constructor({ connectionString = process.env.DATABASE_URL, pool } = {}) {
    this.pool = pool || new Pool({ connectionString });
  }

  async migrate() {
    await this.pool.query(fs.readFileSync(SCHEMA_PATH, 'utf8'));
  }

  async ensureSeed() {
    const { rows } = await this.pool.query('SELECT COUNT(*)::int AS count FROM listings');
    if (rows[0].count > 0) return;
    for (const listing of SEED) {
      await this.save(listing);
    }
  }

  async findNear({
    category = 'all',
    mode = 'all',
    query = '',
    maxDistanceMiles = 25,
    zipCode = null,
  } = {}) {
    const { distanceFromZip } = require('../../domain/services/Geo');
    const { rows } = await this.pool.query('SELECT * FROM listings');
    const q = String(query || '')
      .trim()
      .toLowerCase();
    return rows
      .map(mapListing)
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
    const { rows } = await this.pool.query('SELECT * FROM listings WHERE id = $1', [id]);
    return rows[0] ? mapListing(rows[0]) : null;
  }

  async findByOwnerId(ownerId) {
    const { rows } = await this.pool.query('SELECT * FROM listings WHERE owner_id = $1', [ownerId]);
    return rows.map(mapListing);
  }

  async save(listing) {
    const entity = listing instanceof Listing ? listing : new Listing(listing);
    await this.pool.query(
      `INSERT INTO listings (
        id, title, category, mode, price_per_day, buy_price, distance_miles, rating, review_count,
        owner_name, owner_id, is_pro, location, zip_code, latitude, longitude, thumbnail_tone,
        description, blocked_dates, images
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19::jsonb,$20::jsonb
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        category = EXCLUDED.category,
        mode = EXCLUDED.mode,
        price_per_day = EXCLUDED.price_per_day,
        buy_price = EXCLUDED.buy_price,
        distance_miles = EXCLUDED.distance_miles,
        rating = EXCLUDED.rating,
        review_count = EXCLUDED.review_count,
        owner_name = EXCLUDED.owner_name,
        owner_id = EXCLUDED.owner_id,
        is_pro = EXCLUDED.is_pro,
        location = EXCLUDED.location,
        zip_code = EXCLUDED.zip_code,
        latitude = EXCLUDED.latitude,
        longitude = EXCLUDED.longitude,
        thumbnail_tone = EXCLUDED.thumbnail_tone,
        description = EXCLUDED.description,
        blocked_dates = EXCLUDED.blocked_dates,
        images = EXCLUDED.images`,
      [
        entity.id,
        entity.title,
        entity.category,
        entity.mode,
        entity.pricePerDay,
        entity.buyPrice,
        entity.distanceMiles,
        entity.rating,
        entity.reviewCount,
        entity.ownerName,
        entity.ownerId,
        entity.isPro,
        entity.location,
        entity.zipCode,
        entity.latitude,
        entity.longitude,
        entity.thumbnailTone,
        entity.description,
        JSON.stringify(entity.blockedDates || []),
        JSON.stringify(entity.images || []),
      ],
    );
    return entity;
  }
}

function mapListing(row) {
  return new Listing({
    id: row.id,
    title: row.title,
    category: row.category,
    mode: row.mode,
    pricePerDay: row.price_per_day,
    buyPrice: row.buy_price,
    distanceMiles: Number(row.distance_miles),
    rating: Number(row.rating),
    reviewCount: Number(row.review_count),
    ownerName: row.owner_name,
    ownerId: row.owner_id,
    isPro: row.is_pro,
    location: row.location,
    zipCode: row.zip_code,
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    thumbnailTone: row.thumbnail_tone,
    description: row.description,
    blockedDates: Array.isArray(row.blocked_dates)
      ? row.blocked_dates
      : JSON.parse(row.blocked_dates || '[]'),
    images: Array.isArray(row.images) ? row.images : JSON.parse(row.images || '[]'),
  });
}

module.exports = { PostgresListingRepository };
