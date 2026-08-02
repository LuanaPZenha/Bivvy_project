'use strict';

const express = require('express');
const helmet = require('helmet');
const { applySanitization } = require('@bivvy/shared/security');
const {
  InMemoryListingRepository,
} = require('./infrastructure/persistence/InMemoryListingRepository');
const { ListNearYou } = require('./application/use-cases/ListNearYou');
const { CreateListing } = require('./application/use-cases/CreateListing');
const { GearController } = require('./interfaces/http/controllers/GearController');
const { createGearRouter, createListingsRouter } = require('./interfaces/http/routes/gearRoutes');

function createApp(overrides = {}) {
  const listingRepository = overrides.listingRepository || new InMemoryListingRepository();
  const listNearYou = new ListNearYou({ listingRepository });
  const createListing = new CreateListing({ listingRepository });
  const controller = new GearController({ listNearYou, createListing });

  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  applySanitization(app);
  app.use(express.json({ limit: '50kb' }));

  app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'core-service' }));
  app.use('/gear', createGearRouter(controller));
  app.use('/listings', createListingsRouter(controller));

  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    const status = err.status || 500;
    res.status(status).json({ error: status === 500 ? 'Internal server error' : err.message });
  });

  return app;
}

module.exports = { createApp };
