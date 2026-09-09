'use strict';

const { Booking } = require('../../domain/entities/Booking');

class PostgresBookingRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async findById(id) {
    const { rows } = await this.pool.query('SELECT * FROM bookings WHERE id = $1', [id]);
    return rows[0] ? mapBooking(rows[0]) : null;
  }

  async findForUser(userId) {
    const { rows } = await this.pool.query(
      `SELECT * FROM bookings WHERE renter_id = $1 OR owner_id = $1 ORDER BY created_at DESC`,
      [userId],
    );
    return rows.map(mapBooking);
  }

  async findActiveForListing(listingId) {
    const { rows } = await this.pool.query(
      `SELECT * FROM bookings WHERE listing_id = $1 AND status IN ('requested', 'accepted')`,
      [listingId],
    );
    return rows.map(mapBooking);
  }

  async save(booking) {
    const entity = booking instanceof Booking ? booking : new Booking(booking);
    await this.pool.query(
      `INSERT INTO bookings (
        id, listing_id, renter_id, renter_name, owner_id, start_date, end_date,
        status, pricing, message, payment, created_at, updated_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10,$11::jsonb,$12,$13)
      ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status,
        pricing = EXCLUDED.pricing,
        message = EXCLUDED.message,
        payment = EXCLUDED.payment,
        updated_at = EXCLUDED.updated_at`,
      [
        entity.id,
        entity.listingId,
        entity.renterId,
        entity.renterName,
        entity.ownerId,
        entity.startDate,
        entity.endDate,
        entity.status,
        JSON.stringify(entity.pricing),
        entity.message,
        entity.payment ? JSON.stringify(entity.payment) : null,
        entity.createdAt,
        entity.updatedAt,
      ],
    );
    return entity;
  }
}

function mapBooking(row) {
  const booking = new Booking({
    id: row.id,
    listingId: row.listing_id,
    renterId: row.renter_id,
    renterName: row.renter_name,
    ownerId: row.owner_id,
    startDate: toIso(row.start_date),
    endDate: toIso(row.end_date),
    status: row.status,
    pricing: typeof row.pricing === 'string' ? JSON.parse(row.pricing) : row.pricing,
    message: row.message,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
  if (row.payment) {
    booking.payment = typeof row.payment === 'string' ? JSON.parse(row.payment) : row.payment;
  }
  return booking;
}

function toIso(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

module.exports = { PostgresBookingRepository };
