'use strict';

const path = require('path');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config');
const { helmetOptions } = require('./security/headers');
const { createAuthRateLimit } = require('./security/rateLimit');
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
  // Vercel terminates TLS and forwards the client IP. Trust that hop only there
  // or when an operator explicitly opts in.
  if (process.env.TRUST_PROXY === 'true' || process.env.VERCEL === '1') {
    app.set('trust proxy', 1);
  }
  app.use(helmet(helmetOptions()));
  app.use(express.json({ limit: '100kb' }));
  if (overrides.seedOnRequest) {
    let pending = null;
    app.use((_req, _res, next) => {
      if (!pending) pending = seedDemoUser(store);
      pending.then(() => next()).catch(next);
    });
  }
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
  const authLimit = overrides.authRateLimit || createAuthRateLimit();
  app.use('/api/auth/login', authLimit);
  app.use('/api/auth/register', authLimit);
  app.use('/api/auth', createAuthRouter(store));
  app.use('/api/listings', listingsRouter);
  app.use('/api/bookings', createBookingsRouter(store));
  app.use('/api/cart', createCartRouter(store));

  const webRoot = path.join(__dirname, '../../web');
  app.use(express.static(webRoot, { dotfiles: 'deny', index: 'index.html', redirect: false }));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(webRoot, 'index.html'), (err) => {
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
