'use strict';

/**
 * Shared security helpers for Bivvy microservices.
 * Prefer applying the full stack at the API Gateway; services may reuse pieces.
 */

const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');

function applySecurityHeaders(app) {
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }),
  );
}

function applySanitization(app) {
  app.use(mongoSanitize());
  // Lightweight XSS scrub for string body fields
  app.use((req, _res, next) => {
    if (req.body && typeof req.body === 'object') {
      req.body = scrubObject(req.body);
    }
    next();
  });
}

function scrubString(value) {
  if (typeof value !== 'string') return value;
  return value
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function scrubObject(obj) {
  if (Array.isArray(obj)) return obj.map(scrubObject);
  if (obj && typeof obj === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      out[k] = typeof v === 'string' ? scrubString(v) : scrubObject(v);
    }
    return out;
  }
  return obj;
}

module.exports = {
  applySecurityHeaders,
  applySanitization,
  scrubString,
  scrubObject,
};
