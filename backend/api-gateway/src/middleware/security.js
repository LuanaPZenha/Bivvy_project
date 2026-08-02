'use strict';

const rateLimit = require('express-rate-limit');
const { applySecurityHeaders, applySanitization } = require('@bivvy/shared/security');
const config = require('../config');

function applyGatewaySecurity(app) {
  app.disable('x-powered-by');
  applySecurityHeaders(app);
  applySanitization(app);

  app.use(
    rateLimit({
      windowMs: config.rateLimitWindowMs,
      max: config.rateLimitMax,
      standardHeaders: true,
      legacyHeaders: false,
      message: { error: 'Too many requests. Please try again later.' },
    }),
  );
}

module.exports = { applyGatewaySecurity };
