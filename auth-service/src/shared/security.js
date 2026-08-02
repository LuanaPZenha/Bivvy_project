'use strict';

const mongoSanitize = require('express-mongo-sanitize');

function applySanitization(app) {
  app.use(mongoSanitize());
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

module.exports = { applySanitization, scrubString, scrubObject };
