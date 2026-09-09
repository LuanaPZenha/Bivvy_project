'use strict';

const ALLOWED_STATUSES = new Set([
  'requested',
  'accepted',
  'declined',
  'cancelled',
  'completed',
]);

class Booking {
  constructor({
    id,
    listingId,
    renterId,
    renterName,
    ownerId,
    startDate,
    endDate,
    status = 'requested',
    pricing,
    message = '',
    payment = null,
    createdAt = new Date(),
    updatedAt = new Date(),
  }) {
    if (!listingId) throw clientError('Booking requires listingId');
    if (!renterId) throw clientError('Booking requires renterId');
    if (!startDate || !endDate) throw clientError('Booking requires startDate and endDate');
    if (!pricing) throw clientError('Booking requires pricing');

    const start = parseIsoDate(startDate);
    const end = parseIsoDate(endDate);
    if (end <= start) throw clientError('endDate must be after startDate');

    const normalizedStatus = String(status || 'requested').toLowerCase();
    if (!ALLOWED_STATUSES.has(normalizedStatus)) {
      throw clientError(`Invalid booking status: ${status}`);
    }

    this.id = id;
    this.listingId = listingId;
    this.renterId = renterId;
    this.renterName = renterName || 'Renter';
    this.ownerId = ownerId || null;
    this.startDate = toIsoDate(start);
    this.endDate = toIsoDate(end);
    this.status = normalizedStatus;
    this.pricing = pricing;
    this.message = message || '';
    this.payment = payment || null;
    this.createdAt = createdAt instanceof Date ? createdAt : new Date(createdAt);
    this.updatedAt = updatedAt instanceof Date ? updatedAt : new Date(updatedAt);
  }

  toJSON() {
    return {
      id: this.id,
      listingId: this.listingId,
      renterId: this.renterId,
      renterName: this.renterName,
      ownerId: this.ownerId,
      startDate: this.startDate,
      endDate: this.endDate,
      status: this.status,
      pricing: this.pricing,
      message: this.message,
      payment: this.payment,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  transitionTo(nextStatus) {
    const next = String(nextStatus).toLowerCase();
    if (!ALLOWED_STATUSES.has(next)) {
      throw clientError(`Invalid booking status: ${nextStatus}`);
    }
    const allowed = {
      requested: ['accepted', 'declined', 'cancelled'],
      accepted: ['completed', 'cancelled'],
      declined: [],
      cancelled: [],
      completed: [],
    };
    if (!allowed[this.status].includes(next)) {
      throw clientError(`Cannot transition booking from ${this.status} to ${next}`);
    }
    this.status = next;
    this.updatedAt = new Date();
    return this;
  }
}

function parseIsoDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value));
  if (!match) throw clientError('Dates must use YYYY-MM-DD format');
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  if (Number.isNaN(date.getTime())) throw clientError('Invalid date');
  return date;
}

function toIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

function clientError(message) {
  const err = new Error(message);
  err.status = 400;
  return err;
}

module.exports = { Booking, ALLOWED_STATUSES, parseIsoDate, toIsoDate };
