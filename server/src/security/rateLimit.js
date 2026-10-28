'use strict';

function createRateLimiter({ windowMs, max, keyFn }) {
  const hits = new Map();
  return function rateLimit(req, res, next) {
    const key = keyFn(req);
    const now = Date.now();
    const recent = (hits.get(key) || []).filter((stamp) => now - stamp < windowMs);
    if (recent.length >= max) {
      const retryAfter = Math.max(1, Math.ceil(windowMs / 1000));
      res.set('Retry-After', String(retryAfter));
      return res.status(429).json({ error: 'Too many requests. Try again later.' });
    }
    recent.push(now);
    hits.set(key, recent);
    return next();
  };
}

function createAuthRateLimit() {
  const test = process.env.NODE_ENV === 'test';
  const max = Number(process.env.AUTH_RATE_LIMIT_MAX) || (test ? 1000 : 10);
  const windowMs = Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000;
  return createRateLimiter({
    windowMs,
    max,
    keyFn: (req) => `${req.ip}:${req.path}`,
  });
}

module.exports = { createRateLimiter, createAuthRateLimit };
