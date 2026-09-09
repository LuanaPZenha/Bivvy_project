'use strict';

const jwt = require('jsonwebtoken');

function requireAuth(req, _res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    const err = new Error('Unauthorized');
    err.status = 401;
    return next(err);
  }
  try {
    const secret = process.env.JWT_ACCESS_SECRET || 'test_access_secret_min_32_chars!!';
    const payload = jwt.verify(header.slice(7), secret);
    req.auth = {
      userId: payload.sub,
      email: payload.email,
      role: payload.role || 'both',
      name: payload.name || '',
    };
    return next();
  } catch {
    const err = new Error('Invalid or expired token');
    err.status = 401;
    return next(err);
  }
}

module.exports = { requireAuth };
