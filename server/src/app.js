'use strict';

const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config');
const { createStore } = require('./store/memoryStore');
const { createAuthRouter, seedDemoUser } = require('./routes/auth');
const { createListingsRouter } = require('./routes/listings');
const { createBookingsRouter } = require('./routes/bookings');
const { createCartRouter } = require('./routes/cart');
const { notFound, errorHandler } = require('./middleware/errors');

function createApp(overrides = {}) {
  const store = overrides.store || createStore();
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(
    cors({
      origin: config.corsOrigin === '*' ? true : config.corsOrigin.split(',').map((s) => s.trim()),
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '100kb' }));
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));
  }

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'bivvy-server', version: '2.0.0' });
  });

  app.get('/api/meta', (_req, res) => {
    res.json({
      name: 'Bivvy',
      product: 'Outdoor gear marketplace',
      api: 'v2',
      language: 'JavaScript',
    });
  });

  const listingsRouter = createListingsRouter(store);
  app.use('/api/auth', createAuthRouter(store));
  app.use('/api/listings', listingsRouter);
  // Alias for discovery clients that still call /api/gear/*
  app.use('/api/gear', listingsRouter);
  app.use('/api/bookings', createBookingsRouter(store));
  app.use('/api/cart', createCartRouter(store));

  const webDist = path.join(__dirname, '../../web/dist');
  app.use(express.static(webDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(webDist, 'index.html'), (err) => {
      if (err) next();
    });
  });

  app.use(notFound);
  app.use(errorHandler);

  app.locals.store = store;
  return app;
}

async function bootstrapApp(overrides = {}) {
  const app = createApp(overrides);
  await seedDemoUser(app.locals.store);
  return app;
}

module.exports = { createApp, bootstrapApp };
