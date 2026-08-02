'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config');
const { applyGatewaySecurity } = require('./middleware/security');
const { mountProxies } = require('./routes/proxy');

function createApp() {
  const app = express();

  app.use(
    cors({
      origin: config.corsOrigin.split(',').map((o) => o.trim()),
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
      maxAge: 600,
    }),
  );

  applyGatewaySecurity(app);
  app.use(express.json({ limit: '100kb' }));
  app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'api-gateway' });
  });

  mountProxies(app);

  app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    console.error('[gateway]', err.message);
    res.status(err.status || 500).json({ error: 'Internal server error' });
  });

  return app;
}

module.exports = { createApp };
