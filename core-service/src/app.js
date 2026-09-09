'use strict';

const path = require('path');
const express = require('express');
const helmet = require('helmet');
const { applySanitization } = require('./shared/security');
const {
  InMemoryListingRepository,
} = require('./infrastructure/persistence/InMemoryListingRepository');
const {
  InMemoryBookingRepository,
} = require('./infrastructure/persistence/InMemoryBookingRepository');
const { LocalImageStore } = require('./infrastructure/storage/LocalImageStore');
const { ListNearYou } = require('./application/use-cases/ListNearYou');
const { GetListingById } = require('./application/use-cases/GetListingById');
const { CreateListing } = require('./application/use-cases/CreateListing');
const { ListOwnerListings } = require('./application/use-cases/ListOwnerListings');
const { CreateBooking } = require('./application/use-cases/CreateBooking');
const { ListBookings } = require('./application/use-cases/ListBookings');
const { UpdateBookingStatus } = require('./application/use-cases/UpdateBookingStatus');
const { QuoteBooking } = require('./application/use-cases/QuoteBooking');
const { SimulateCheckout } = require('./application/use-cases/SimulateCheckout');
const { AddListingImage } = require('./application/use-cases/AddListingImage');
const { GetListingImage } = require('./application/use-cases/GetListingImage');
const { CheckoutCart } = require('./application/use-cases/CheckoutCart');
const { GearController } = require('./interfaces/http/controllers/GearController');
const {
  createGearRouter,
  createListingsRouter,
  createBookingsRouter,
  createCartRouter,
} = require('./interfaces/http/routes/gearRoutes');
const { seedDemoListingImages } = require('./infrastructure/storage/seedDemoImages');

function createApp(overrides = {}) {
  const listingRepository = overrides.listingRepository || new InMemoryListingRepository();
  const bookingRepository = overrides.bookingRepository || new InMemoryBookingRepository();
  const imageStore =
    overrides.imageStore ||
    new LocalImageStore({
      rootDir: overrides.uploadDir || process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads'),
    });

  const controller = new GearController({
    listNearYou: new ListNearYou({ listingRepository }),
    getListingById: new GetListingById({ listingRepository }),
    createListing: new CreateListing({ listingRepository }),
    listOwnerListings: new ListOwnerListings({ listingRepository }),
    createBooking: new CreateBooking({ listingRepository, bookingRepository }),
    listBookings: new ListBookings({ bookingRepository }),
    updateBookingStatus: new UpdateBookingStatus({ bookingRepository }),
    quoteBooking: new QuoteBooking({ listingRepository }),
    simulateCheckout: new SimulateCheckout({ bookingRepository }),
    addListingImage: new AddListingImage({ listingRepository, imageStore }),
    getListingImage: new GetListingImage({ listingRepository, imageStore }),
    checkoutCart: new CheckoutCart({ listingRepository, bookingRepository }),
  });

  const app = express();
  app.disable('x-powered-by');
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.use(express.json({ limit: '50kb' }));
  applySanitization(app);

  app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'core-service' }));
  app.use('/gear', createGearRouter(controller));
  app.use('/listings', createListingsRouter(controller));
  app.use('/bookings', createBookingsRouter(controller));
  app.use('/cart', createCartRouter(controller));

  app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    if (err && err.name === 'MulterError') {
      const status = err.code === 'LIMIT_FILE_SIZE' ? 400 : 400;
      return res.status(status).json({ error: err.message });
    }
    const status = err.status || 500;
    res.status(status).json({ error: status === 500 ? 'Internal server error' : err.message });
  });

  if (!overrides.skipDemoImages) {
    // Fire-and-forget seed of tiny demo PNGs for a few listings (idempotent).
    seedDemoListingImages({ listingRepository, imageStore }).catch((err) => {
      console.warn('[core] demo image seed skipped:', err.message);
    });
  }

  return app;
}

module.exports = { createApp };
