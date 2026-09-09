'use strict';

const {
  InMemoryListingRepository,
} = require('./InMemoryListingRepository');
const {
  InMemoryBookingRepository,
} = require('./InMemoryBookingRepository');
const { PostgresListingRepository } = require('./PostgresListingRepository');
const { PostgresBookingRepository } = require('./PostgresBookingRepository');

async function createCoreRepositories() {
  if (process.env.USE_IN_MEMORY === '1' || !process.env.DATABASE_URL) {
    return {
      listingRepository: new InMemoryListingRepository(),
      bookingRepository: new InMemoryBookingRepository(),
      persistence: 'memory',
    };
  }

  try {
    const listingRepository = new PostgresListingRepository();
    await listingRepository.migrate();
    await listingRepository.ensureSeed();
    return {
      listingRepository,
      bookingRepository: new PostgresBookingRepository(listingRepository.pool),
      persistence: 'postgres',
    };
  } catch (err) {
    console.warn('[core-service] Postgres unavailable, using in-memory stores:', err.message);
    return {
      listingRepository: new InMemoryListingRepository(),
      bookingRepository: new InMemoryBookingRepository(),
      persistence: 'memory',
    };
  }
}

module.exports = { createCoreRepositories };
